/* Opus 5 — simplified Puppet Master shell plus the review control strip.
 *
 * Every concept mounts the same shell so that spacing, rail/panel pressure and
 * effective content width are comparable between them. The shell keeps its top
 * and bottom bars in Hub previews (CONCEPT_RULES rule 5).
 *
 * Width mode (normal / narrow / squeezed) is a PRESENTATION mode derived from
 * the app's own width at explicit resize checkpoints. It is not semantic state:
 * nothing about what a setting means depends on it.
 */
(function () {
  "use strict";

  var THEMES = [
    { id: "friendly-dark", label: "Friendly Dark" },
    { id: "friendly-light", label: "Friendly Light" },
    { id: "glass-dark", label: "Glass Dark" },
    { id: "glass-light", label: "Glass Light" },
    { id: "retro-dark", label: "Retro Dark" },
    { id: "retro-light", label: "Retro Light" },
    { id: "basic-dark", label: "Basic Dark" },
    { id: "basic-light", label: "Basic Light" }
  ];

  var WIDTHS = [760, 900, 1280, 1700, 2200, 2500];

  var RAIL_ITEMS = [
    { icon: "list", label: "Threads" },
    { icon: "layers", label: "Goals" },
    { icon: "users", label: "Crew" },
    { icon: "folder", label: "Files" },
    { icon: "gauge", label: "Usage" },
    { icon: "sliders", label: "Settings", current: true }
  ];

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function icon(name, size) { return window.PMIcons ? window.PMIcons.icon(name, size) : ""; }

  function mount(config) {
    var cfg = config || {};
    var root = document.getElementById(cfg.rootId || "pm-root");
    if (!root) throw new Error("PMShell: root element not found");

    /* ------------------------------------------------------ review strip */
    var review = el("div", "pm-review");
    review.setAttribute("aria-label", "Concept review controls");

    var brand = el("div", "pm-review-brand");
    // The model name is also present statically in the page source, which is
    // what the Hub validator reads. This copy keeps it visible at the top.
    brand.innerHTML =
      '<span class="pm-review-model">Opus 5</span>' +
      '<span class="pm-review-concept">' + escapeHtml(cfg.concept || "") + "</span>";
    review.appendChild(brand);

    var themeGroup = el("div", "pm-review-group");
    var themeId = "pm-theme-" + (cfg.conceptId || "c");
    themeGroup.innerHTML = '<label for="' + themeId + '">Theme</label>';
    var themeSel = el("select");
    themeSel.id = themeId;
    THEMES.forEach(function (t) {
      var o = document.createElement("option");
      o.value = t.id; o.textContent = t.label;
      themeSel.appendChild(o);
    });
    themeSel.value = cfg.theme || "friendly-dark";
    themeGroup.appendChild(themeSel);
    review.appendChild(themeGroup);

    var widthGroup = el("div", "pm-review-group");
    var widthId = "pm-width-" + (cfg.conceptId || "c");
    widthGroup.innerHTML = '<label for="' + widthId + '">App width</label>';
    var widthSel = el("select");
    widthSel.id = widthId;
    WIDTHS.forEach(function (w) {
      var o = document.createElement("option");
      o.value = String(w); o.textContent = w + " px";
      widthSel.appendChild(o);
    });
    var fitOpt = document.createElement("option");
    fitOpt.value = "fit"; fitOpt.textContent = "Fit window";
    widthSel.appendChild(fitOpt);
    widthSel.value = "1280";
    widthGroup.appendChild(widthSel);
    review.appendChild(widthGroup);

    var railBtn = el("button", "pm-toggle", icon("panelLeft") + "<span>Rail</span>");
    railBtn.type = "button";
    railBtn.setAttribute("aria-pressed", "true");

    var panelBtn = el("button", "pm-toggle", icon("panelRight") + "<span>Assistant</span>");
    panelBtn.type = "button";
    panelBtn.setAttribute("aria-pressed", "false");

    var motionBtn = el("button", "pm-toggle", icon("zap") + "<span>Reduced motion</span>");
    motionBtn.type = "button";
    motionBtn.setAttribute("aria-pressed", "false");

    var toggles = el("div", "pm-review-group");
    toggles.appendChild(railBtn);
    toggles.appendChild(panelBtn);
    toggles.appendChild(motionBtn);
    review.appendChild(toggles);

    if (cfg.extraControls) {
      var extra = el("div", "pm-review-group");
      extra.appendChild(cfg.extraControls);
      review.appendChild(extra);
    }

    /* -------------------------------------------------------------- shell */
    var stage = el("div", "pm-stage");
    var app = el("div", "pm-app");
    app.setAttribute("data-rail", "open");
    app.setAttribute("data-panel", "closed");
    app.setAttribute("data-width", "normal");

    var topbar = el("div", "pm-topbar");
    topbar.innerHTML =
      '<div class="pm-topbar-mark">' + icon("layers") + "<span>Puppet Master</span></div>" +
      '<div class="pm-topbar-crumbs">' +
        '<span>orchard-api</span>' +
        '<span class="pm-topbar-sep">' + icon("chevronRight", 12) + "</span>" +
        "<span>Settings</span>" +
      "</div>" +
      '<div class="pm-topbar-spacer"></div>';
    var topActions = el("div", "pm-topbar-actions");
    var tbRail = el("button", "pm-topbar-btn", icon("panelLeft"));
    tbRail.type = "button"; tbRail.title = "Toggle navigation rail"; tbRail.setAttribute("aria-label", "Toggle navigation rail");
    tbRail.setAttribute("aria-pressed", "true");
    var tbPanel = el("button", "pm-topbar-btn", icon("panelRight"));
    tbPanel.type = "button"; tbPanel.title = "Toggle Assistant panel"; tbPanel.setAttribute("aria-label", "Toggle Assistant panel");
    tbPanel.setAttribute("aria-pressed", "false");
    topActions.appendChild(tbRail);
    topActions.appendChild(tbPanel);
    topbar.appendChild(topActions);

    var body = el("div", "pm-body");

    var rail = el("nav", "pm-rail");
    rail.setAttribute("aria-label", "Puppet Master sections");
    RAIL_ITEMS.forEach(function (item) {
      var a = el("button", "pm-rail-item", icon(item.icon) + '<span class="pm-rail-label">' + item.label + "</span>");
      a.type = "button";
      a.title = item.label;
      if (item.current) a.setAttribute("aria-current", "page");
      rail.appendChild(a);
    });
    rail.appendChild(el("div", "pm-rail-spacer"));
    var foot = el("div", "pm-rail-foot", icon("user") + "<span>Jared · orchard-api</span>");
    rail.appendChild(foot);

    var main = el("main", "pm-main");
    main.id = "pm-main";

    var panel = el("aside", "pm-panel");
    panel.setAttribute("aria-label", "Assistant panel");
    panel.innerHTML =
      '<div class="pm-panel-head">' + icon("mask") + '<span class="pm-panel-title">Assistant</span>' +
      '<span class="pm-topbar-spacer"></span><span>Collaborator</span></div>';
    var panelBody = el("div", "pm-panel-body");
    panelBody.innerHTML =
      '<div class="pm-panel-msg is-user">Can you check whether the Claude CLI profile is still signed in?</div>' +
      '<div class="pm-panel-msg"><strong>Assistant</strong><br>The <em>work</em> profile refreshed its catalogue eleven minutes ago. ' +
      "The <em>personal</em> profile is signed out — its last successful generation was four days ago.</div>" +
      '<div class="pm-panel-msg is-user">Open the provider manager for me.</div>';
    panel.appendChild(panelBody);
    var composer = el("div", "pm-panel-composer");
    var field = el("div", "pm-composer-field");
    field.setAttribute("contenteditable", "true");
    field.setAttribute("role", "textbox");
    field.setAttribute("aria-multiline", "true");
    field.setAttribute("aria-label", "Message the Assistant");
    field.textContent = "Check the conection health for both Claude profiles and tell me which one is recomended.";
    composer.appendChild(field);
    composer.appendChild(el("div", "pm-composer-hint", "Spelling is checked locally. Right-click an underlined word, or press Ctrl + period."));
    panel.appendChild(composer);

    body.appendChild(rail);
    body.appendChild(main);
    body.appendChild(panel);

    var bottombar = el("div", "pm-bottombar");
    bottombar.innerHTML =
      '<div class="pm-bottombar-item">' + icon("link", 12) + "<span>main · clean</span></div>" +
      '<div class="pm-bottombar-item is-optional">' + icon("cpu", 12) + "<span>Claude Opus 4.6 · work profile</span></div>" +
      '<div class="pm-bottombar-item is-optional">' + icon("gauge", 12) + "<span>Included usage 46%</span></div>" +
      '<div class="pm-bottombar-spacer"></div>' +
      '<div class="pm-bottombar-item">' + icon("shield", 12) + "<span>Full Access</span></div>";

    app.appendChild(topbar);
    app.appendChild(body);
    app.appendChild(bottombar);
    stage.appendChild(app);

    var live = el("div", "pm-visually-hidden");
    live.id = "pm-live-region";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");

    root.appendChild(review);
    root.appendChild(stage);
    root.appendChild(live);

    /* ------------------------------------------------------------ wiring */

    function setTheme(id) {
      document.documentElement.setAttribute("data-theme", id);
      document.documentElement.style.colorScheme = /-dark$/.test(id) ? "dark" : "light";
      themeSel.value = id;
      notifyLayout("theme");
    }

    function setWidth(value) {
      if (value === "fit") {
        app.style.removeProperty("--pm-app-width");
      } else {
        app.style.setProperty("--pm-app-width", value + "px");
      }
      widthSel.value = String(value);
      notifyLayout("width");
    }

    function setRail(open) {
      app.setAttribute("data-rail", open ? "open" : "closed");
      railBtn.setAttribute("aria-pressed", String(open));
      tbRail.setAttribute("aria-pressed", String(open));
      notifyLayout("rail");
    }

    function setPanel(open) {
      app.setAttribute("data-panel", open ? "open" : "closed");
      panelBtn.setAttribute("aria-pressed", String(open));
      tbPanel.setAttribute("aria-pressed", String(open));
      notifyLayout("panel");
    }

    function setReducedMotion(on) {
      document.documentElement.setAttribute("data-reduced-motion", on ? "1" : "0");
      motionBtn.setAttribute("aria-pressed", String(on));
      notifyLayout("motion");
    }

    themeSel.addEventListener("change", function () { setTheme(themeSel.value); });
    widthSel.addEventListener("change", function () { setWidth(widthSel.value); });
    railBtn.addEventListener("click", function () { setRail(app.getAttribute("data-rail") !== "open"); });
    tbRail.addEventListener("click", function () { setRail(app.getAttribute("data-rail") !== "open"); });
    panelBtn.addEventListener("click", function () { setPanel(app.getAttribute("data-panel") !== "open"); });
    tbPanel.addEventListener("click", function () { setPanel(app.getAttribute("data-panel") !== "open"); });
    motionBtn.addEventListener("click", function () {
      setReducedMotion(document.documentElement.getAttribute("data-reduced-motion") !== "1");
    });

    /* Width mode, evaluated at explicit resize checkpoints and debounced so a
     * drag does not re-lay out on every frame (no flashing during resize). */
    var resizeTimer = 0;
    var lastMode = "normal";

    function evaluateWidthMode() {
      var w = app.clientWidth;
      // A box that has not been laid out yet is not a narrow window. Classifying
      // it would flash the squeezed layout on every load.
      if (w < 200) return;
      var mode = w < 820 ? "squeezed" : (w < 1100 ? "narrow" : "normal");
      if (mode !== lastMode) {
        lastMode = mode;
        app.setAttribute("data-width", mode);
        if (cfg.onWidthMode) cfg.onWidthMode(mode, w);
      }
      notifyLayout("resize");
    }

    function scheduleResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(evaluateWidthMode, 120);
    }

    if (window.ResizeObserver) {
      new window.ResizeObserver(scheduleResize).observe(app);
    } else {
      window.addEventListener("resize", scheduleResize);
    }
    window.addEventListener("resize", scheduleResize);

    function notifyLayout(reason) {
      if (!cfg.onLayout) return;
      var done = false;
      function run() { if (done) return; done = true; cfg.onLayout(reason); }
      if (window.requestAnimationFrame) window.requestAnimationFrame(run);
      window.setTimeout(run, 48);   // frames may never arrive in a hidden tab
    }

    /* The Hub drives theme / reduced motion / width when the page is embedded.
     * Mirror those into the local controls so the two never disagree. */
    window.addEventListener("pm-concept-state-applied", function (e) {
      var s = e.detail || {};
      if (s.theme) themeSel.value = s.theme;
      motionBtn.setAttribute("aria-pressed", String(!!s.reducedMotion));
      if (typeof s.testWidth === "number") {
        app.style.setProperty("--pm-app-width", s.testWidth + "px");
      }
      scheduleResize();
      notifyLayout("hub");
    });

    setTheme(cfg.theme || "friendly-dark");
    setWidth(1280);
    setReducedMotion(false);
    // Evaluate once the first layout has actually happened — without assuming a
    // frame will ever be painted.
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(function () { window.requestAnimationFrame(evaluateWidthMode); });
    }
    window.setTimeout(evaluateWidthMode, 48);
    window.setTimeout(evaluateWidthMode, 200);

    if (window.PMSpellcheck) window.PMSpellcheck.attach(field, {});

    return {
      app: app,
      main: main,
      panel: panel,
      review: review,
      setTheme: setTheme,
      setWidth: setWidth,
      setRail: setRail,
      setPanel: setPanel,
      setReducedMotion: setReducedMotion,
      widthMode: function () { return lastMode; },
      announce: function (msg) { live.textContent = msg; },
      composerField: field
    };
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* Entrance animations that stagger with animation-fill-mode: both hold their
   * first keyframe during the delay, which means the content is invisible until
   * the animation runs. If it never runs — a throttled or background tab, a
   * platform that skips animations, a print — the page stays blank. Settings
   * must never depend on an animation completing to be readable.
   *
   * So the entrance class is always removed after its own window. If the
   * animation played, nothing changes (it already ended at the resting state).
   * If it never played, the content simply becomes visible. */
  function entrance(el, className, ms) {
    if (!el) return;
    el.classList.add(className);
    var reduced = document.documentElement.getAttribute("data-reduced-motion") === "1";
    window.setTimeout(function () {
      el.classList.remove(className);
    }, reduced ? 140 : (ms || 600));
  }

  window.PMShell = {
    mount: mount, THEMES: THEMES, WIDTHS: WIDTHS,
    escapeHtml: escapeHtml, el: el, icon: icon, entrance: entrance
  };
})();
