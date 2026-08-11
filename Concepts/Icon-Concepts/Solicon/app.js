(function () {
  "use strict";

  const data = window.SOLICON_DATA;
  if (!data) {
    document.body.innerHTML = "<main><p>Solicon data is missing. Run <code>python3 tools/build_assets.py</code>.</p></main>";
    return;
  }

  const byId = (id) => document.getElementById(id);
  const themeMap = new Map(data.themes.map((theme) => [theme.id, theme]));
  const motionMap = new Map(data.motions.map((motion) => [motion.id, motion]));
  const state = {
    view: "static",
    canvasTheme: "friendly-dark",
    treatment: "character",
    form: "full",
    presentation: "tiled",
    tone: "all",
    context: "app",
    speed: 1,
    paused: false,
    reduced: false,
    motion: "all",
  };
  let previewSequence = 0;
  let loaderObserver = null;
  let toastTimer = null;

  const downloadIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 18v2h14v-2"/></svg>';
  const packIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5zM4 7.5l8 4.5m8-4.5L12 12m0 9v-9"/></svg>';

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function label(value) {
    return String(value).split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  }

  function attrs(object, widthScale) {
    return Object.entries(object)
      .filter(([key]) => key !== "class")
      .map(([key, raw]) => {
        let value = raw;
        if (widthScale !== 1 && ["width", "rx", "ry"].includes(key)) {
          value = (Number(raw || 0) * widthScale).toFixed(3);
        }
        return `${key}="${escapeHtml(value)}"`;
      })
      .join(" ");
  }

  function colorsFor(theme, treatment, presentation) {
    const t = theme.tokens;
    if (treatment === "flat") {
      const mark = presentation === "tiled" ? t.background : t.accent_primary;
      return {
        tile0: presentation === "tiled" ? t.accent_primary : "transparent",
        tile1: presentation === "tiled" ? t.accent_primary : "transparent",
        mark,
        accent: mark,
        secondary: mark,
        edge: "transparent",
      };
    }
    return {
      tile0: presentation === "tiled" ? t.background : "transparent",
      tile1: presentation === "tiled" ? t.surface_elevated : "transparent",
      mark: t.text_primary,
      accent: t.accent_primary,
      secondary: t.secondary_accent,
      edge: t.border,
    };
  }

  function radiusFor(theme, treatment) {
    if (treatment === "flat") return 6.29;
    return { friendly: 8.4, glass: 9.2, retro: 0.8, basic: 4 }[theme.family];
  }

  function previewSvg(options) {
    const theme = typeof options.theme === "string" ? themeMap.get(options.theme) : options.theme;
    const treatment = options.treatment || "character";
    const presentation = options.presentation || "tiled";
    const form = options.form || "full";
    const motion = options.motion ? (typeof options.motion === "string" ? motionMap.get(options.motion) : options.motion) : null;
    const duration = Math.round((motion ? motion.duration_ms : 1800) / (options.speed || 1));
    const g = data.geometry;
    const colors = colorsFor(theme, treatment, presentation);
    const suffix = `solicon-${++previewSequence}`;
    const gradient = `${suffix}-tile`;
    const mask = `${suffix}-p-mask`;
    const dots = `${suffix}-dots`;
    const sheen = `${suffix}-sheen`;
    const radius = radiusFor(theme, treatment);
    const isCharacter = treatment === "character";
    const isMicro = form === "micro";

    let definitions = "";
    if (isCharacter && theme.family === "glass") {
      definitions += `<linearGradient id="${gradient}" x1=".08" y1="0" x2=".92" y2="1"><stop offset="0" stop-color="${escapeHtml(colors.tile1)}"/><stop offset=".52" stop-color="${escapeHtml(colors.tile0)}"/><stop offset="1" stop-color="${escapeHtml(colors.secondary)}" stop-opacity=".34"/></linearGradient><linearGradient id="${sheen}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".36"/><stop offset=".38" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
    } else {
      definitions += `<linearGradient id="${gradient}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${escapeHtml(colors.tile1)}"/><stop offset="1" stop-color="${escapeHtml(colors.tile0)}"/></linearGradient>`;
    }
    if (isCharacter && theme.family === "friendly") {
      definitions += `<pattern id="${dots}" width="4.5" height="4.5" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".32" fill="${escapeHtml(colors.accent)}" opacity=".18"/></pattern>`;
    }
    definitions += `<mask id="${mask}" maskUnits="userSpaceOnUse" x="9" y="20" width="14" height="20"><rect x="9" y="20" width="14" height="20" fill="#000"/><path d="${escapeHtml(g.letter_p_outer)}" fill="#fff"/><path d="${escapeHtml(g.letter_p_cutout)}" fill="#000"/></mask>`;

    let tile = "";
    if (presentation === "tiled") {
      let texture = "";
      if (isCharacter && theme.family === "friendly") texture = `<rect width="43.2" height="43.2" rx="${radius}" fill="url(#${dots})"/>`;
      if (isCharacter && theme.family === "glass") texture = `<path d="M3 3h28c-7 3-13 8-18 15-4 6-7 11-10 16z" fill="url(#${sheen})" opacity=".65"/>`;
      if (isCharacter && theme.family === "retro") texture = `<path d="M2 9.6h39.2M2 21.6h39.2M2 33.6h39.2M9.6 2v39.2M21.6 2v39.2M33.6 2v39.2" fill="none" stroke="${escapeHtml(colors.edge)}" stroke-width=".3" opacity=".34"/>`;
      tile = `<g class="pm-tile-layer"><rect width="43.2" height="43.2" rx="${radius}" fill="url(#${gradient})"/>${texture}<rect x=".6" y=".6" width="42" height="42" rx="${Math.max(radius - .6, 0)}" fill="none" stroke="${escapeHtml(colors.edge)}" stroke-width="1.2" opacity="${isCharacter ? ".8" : "0"}"/></g>`;
    }

    const braces = isMicro ? "" : `<g class="pm-braces" fill="${escapeHtml(colors.secondary)}"><path class="pm-brace-left" d="${escapeHtml(g.brace_left)}"/><path class="pm-brace-right" d="${escapeHtml(g.brace_right)}"/></g>`;
    const monogramTransform = isMicro ? ' transform="translate(21.6 30.4) scale(1.12) translate(-21.6 -30.4)"' : "";
    const motionClass = motion ? ` motion-${motion.id}` : "";
    const title = motion ? `${motion.label} loader, ${theme.label}` : `Puppet Master logo, ${theme.label}`;
    return `<svg class="preview-svg${motionClass}" viewBox="${escapeHtml(g.viewBox)}" role="img" aria-label="${escapeHtml(title)}" style="--duration:${duration}ms"><defs>${definitions}</defs>${tile}<g class="pm-mark"><g class="pm-stick-back" fill="${escapeHtml(colors.secondary)}"><path d="${escapeHtml(g.stick_back_left)}"/><path d="${escapeHtml(g.stick_back_right)}"/></g><path class="pm-stick-front" d="${escapeHtml(g.stick_front)}" fill="${escapeHtml(colors.accent)}"/><g class="pm-strings" fill="${escapeHtml(colors.secondary)}"><rect ${attrs(g.string_left, isMicro ? 1.35 : 1)}/><rect ${attrs(g.string_right, isMicro ? 1.35 : 1)}/></g><g class="pm-monogram"${monogramTransform} fill="${escapeHtml(colors.mark)}"><rect x="9" y="20" width="14" height="20" mask="url(#${mask})"/><path d="${escapeHtml(g.letter_m)}"/></g>${braces}</g></svg>`;
  }

  function themeStyle(theme) {
    const t = theme.tokens;
    return `--asset-bg:${t.background};--asset-surface:${t.surface};--asset-ink:${t.text_primary};--asset-line:${t.border};--asset-accent:${t.accent_primary}`;
  }

  function contextMarkup(markup, context) {
    if (context === "titlebar") {
      return `<div class="titlebar-mock">${markup}<span class="titlebar-project" aria-hidden="true"></span><span class="titlebar-tabs" aria-hidden="true"><i></i><i></i><i></i></span></div>`;
    }
    if (context === "tray") {
      return `<div class="tray-mock"><i aria-hidden="true"></i><i aria-hidden="true"></i>${markup}<i aria-hidden="true"></i></div>`;
    }
    return markup;
  }

  function staticAsset(themeId) {
    return data.static_assets.find((asset) => asset.theme_id === themeId && asset.treatment === state.treatment && asset.form === state.form);
  }

  function staticCard(theme) {
    const asset = staticAsset(theme.id);
    const preview = `<img src="${escapeHtml(asset.path)}" alt="Puppet Master ${escapeHtml(theme.label)} ${state.treatment} ${state.form} logo" loading="lazy" width="128" height="128">`;
    return `<article class="asset-card" data-theme-card="${theme.id}"><header class="asset-card-head"><div class="asset-card-title"><h3>${escapeHtml(theme.label)}</h3><p>${label(state.treatment)} · ${label(state.form)} · ${label(theme.family)}</p></div><span class="asset-code">${theme.scheme}</span></header><div class="context-stage" data-context="${state.context}" style="${themeStyle(theme)}">${contextMarkup(preview, state.context)}</div><footer class="asset-card-foot"><a class="download-link" href="${escapeHtml(asset.path)}" download>${downloadIcon}SVG</a><a class="pack-link" href="bundles/platform/${theme.id}-${state.treatment}.zip" download>${packIcon}Platform pack</a></footer></article>`;
  }

  function renderStatic() {
    byId("static-grid").innerHTML = data.themes.map(staticCard).join("");
  }

  function filteredMotions() {
    return data.motions.filter((motion) => (state.tone === "all" || motion.tone === state.tone) && (state.motion === "all" || motion.id === state.motion));
  }

  function loaderCard(theme, motion) {
    const asset = data.loader_assets.find((candidate) => candidate.theme_id === theme.id && candidate.motion_id === motion.id && candidate.treatment === state.treatment && candidate.presentation === state.presentation);
    const options = escapeHtml(JSON.stringify({ theme: theme.id, motion: motion.id, treatment: state.treatment, presentation: state.presentation, form: "full", speed: state.speed }));
    return `<article class="asset-card loader-card" data-lazy-preview="${options}"><header class="asset-card-head"><div class="asset-card-title"><h3>${escapeHtml(motion.label)}</h3><p>${escapeHtml(theme.label)} · ${label(state.presentation)}</p></div><span class="asset-code">${motion.duration_ms} ms</span></header><div class="context-stage loader-mount" data-context="${state.context}" style="${themeStyle(theme)}"><span class="preview-sentinel" aria-hidden="true"></span></div><footer class="asset-card-foot"><a class="download-link" href="${escapeHtml(asset.path)}" download>${downloadIcon}SVG</a><a class="pack-link" href="bundles/platform/${theme.id}-${state.treatment}.zip" download>${packIcon}Platform pack</a></footer></article>`;
  }

  function mountLoaderCard(card) {
    if (card.dataset.mounted === "true") return;
    const mount = card.querySelector(".loader-mount");
    const options = JSON.parse(card.dataset.lazyPreview);
    mount.innerHTML = contextMarkup(previewSvg(options), state.context);
    card.dataset.mounted = "true";
  }

  function renderLoaders() {
    if (loaderObserver) loaderObserver.disconnect();
    const motions = filteredMotions();
    byId("loader-grid").innerHTML = data.themes.flatMap((theme) => motions.map((motion) => loaderCard(theme, motion))).join("");
    const cards = [...document.querySelectorAll("[data-lazy-preview]")];
    if (!("IntersectionObserver" in window)) {
      cards.forEach(mountLoaderCard);
      return;
    }
    loaderObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        mountLoaderCard(entry.target);
        loaderObserver.unobserve(entry.target);
      });
    }, { rootMargin: "480px 0px" });
    cards.forEach((card) => loaderObserver.observe(card));
  }

  function renderMotionIndex() {
    const chips = [{ id: "all", label: "All motions" }, ...data.motions];
    byId("motion-index").innerHTML = chips.map((motion) => `<button type="button" class="motion-chip${state.motion === motion.id ? " is-on" : ""}" data-motion="${motion.id}" aria-pressed="${state.motion === motion.id}">${escapeHtml(motion.label)}</button>`).join("");
  }

  function renderBundles() {
    const groupDefs = [
      ["Theme libraries", "Eight palette-complete packs", data.bundles.filter((bundle) => bundle.kind === "theme")],
      ["Motion libraries", "Eight animation-complete packs", data.bundles.filter((bundle) => bundle.kind === "motion")],
      ["Treatment libraries", "Flat and character systems", data.bundles.filter((bundle) => bundle.kind === "treatment")],
      ["Platform packs", "App, title-bar, tray, ICNS, and ICO", data.themes.flatMap((theme) => data.treatments.map((treatment) => ({ label: `${theme.label} · ${label(treatment)}`, path: `bundles/platform/${theme.id}-${treatment}.zip`, kind: "platform" })))],
      ["Complete library", "All generated assets and contracts", data.bundles.filter((bundle) => bundle.kind === "complete")],
    ];
    byId("bundle-groups").innerHTML = groupDefs.map(([title, note, bundles]) => `<section class="bundle-section"><header><h3>${title}</h3><span>${note}</span></header><div class="bundle-list">${bundles.map((bundle) => `<a class="bundle-item" href="${escapeHtml(bundle.path)}" download><span><strong>${escapeHtml(bundle.label)}</strong><small>${label(bundle.kind)} ZIP</small></span>${downloadIcon}</a>`).join("")}</div></section>`).join("");
  }

  function setCanvasTheme(themeId) {
    const theme = themeMap.get(themeId) || data.themes[0];
    state.canvasTheme = theme.id;
    const t = theme.tokens;
    const root = document.documentElement;
    const pairs = {
      "--canvas": t.background,
      "--surface": t.surface,
      "--surface-raised": t.surface_elevated,
      "--surface-alt": t.surface,
      "--ink": t.text_primary,
      "--ink-2": t.text_secondary,
      "--ink-3": t.text_muted,
      "--line": t.border,
      "--line-soft": t.border_light,
      "--accent": t.accent_primary,
      "--accent-2": t.secondary_accent,
      "--accent-3": t.accent_orange,
    };
    Object.entries(pairs).forEach(([property, value]) => root.style.setProperty(property, value));
    root.dataset.canvasTheme = theme.id;
    root.style.colorScheme = theme.scheme;
    byId("hero-theme-label").textContent = theme.label;
    byId("hero-logo").src = `assets/static/pm-${theme.id}-${state.treatment}-${state.form}.svg`;
    document.querySelector(".brand-lockup img").src = `assets/static/pm-${theme.id}-${state.treatment}-micro.svg`;
  }

  function setView(view, updateHash) {
    if (!["static", "loaders", "downloads"].includes(view)) view = "static";
    state.view = view;
    document.querySelectorAll("[data-view]").forEach((tab) => {
      const selected = tab.dataset.view === view;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    document.querySelectorAll(".gallery-view").forEach((panel) => {
      const selected = panel.id === `view-${view}`;
      panel.hidden = !selected;
      panel.classList.toggle("is-active", selected);
    });
    document.body.classList.toggle("view-loaders", view === "loaders");
    document.body.classList.toggle("view-downloads", view === "downloads");
    document.querySelectorAll(".loader-control").forEach((control) => { control.hidden = view !== "loaders"; });
    document.querySelectorAll(".static-control").forEach((control) => { control.hidden = view !== "static"; });
    document.querySelectorAll(".asset-control").forEach((control) => { control.hidden = view === "downloads"; });
    byId("dock-title").textContent = { static: "Identity board", loaders: "Motion lab", downloads: "Pack room" }[view];
    if (view === "loaders") renderLoaders();
    if (updateHash) history.replaceState(null, "", `#${view}`);
  }

  function toast(message) {
    const element = byId("status-toast");
    element.textContent = message;
    element.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove("is-visible"), 1800);
  }

  function updatePressed(group, value, key) {
    state[key] = value;
    document.querySelectorAll(`[data-${group}]`).forEach((button) => {
      const selected = button.dataset[group] === value;
      button.classList.toggle("is-on", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function initializeControls() {
    const picker = byId("canvas-theme");
    picker.innerHTML = data.themes.map((theme) => `<option value="${theme.id}">${escapeHtml(theme.label)}</option>`).join("");
    picker.value = state.canvasTheme;
    picker.addEventListener("change", () => setCanvasTheme(picker.value));

    document.querySelectorAll("[data-view]").forEach((tab) => tab.addEventListener("click", () => setView(tab.dataset.view, true)));
    document.querySelector(".view-tabs").addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      const tabs = [...document.querySelectorAll("[data-view]")];
      const index = tabs.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault();
      const next = tabs[(index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
      next.click();
      next.focus();
    });

    document.querySelectorAll("[data-treatment]").forEach((button) => button.addEventListener("click", () => {
      updatePressed("treatment", button.dataset.treatment, "treatment");
      setCanvasTheme(state.canvasTheme);
      renderStatic();
      renderLoaders();
    }));
    document.querySelectorAll("[data-form]").forEach((button) => button.addEventListener("click", () => {
      updatePressed("form", button.dataset.form, "form");
      setCanvasTheme(state.canvasTheme);
      renderStatic();
    }));
    document.querySelectorAll("[data-presentation]").forEach((button) => button.addEventListener("click", () => {
      updatePressed("presentation", button.dataset.presentation, "presentation");
      renderLoaders();
    }));

    byId("tone-filter").addEventListener("change", (event) => { state.tone = event.target.value; state.motion = "all"; renderMotionIndex(); renderLoaders(); });
    byId("context-select").addEventListener("change", (event) => { state.context = event.target.value; renderStatic(); renderLoaders(); });
    byId("speed-select").addEventListener("change", (event) => { state.speed = Number(event.target.value); renderLoaders(); toast(`Playback speed ${event.target.options[event.target.selectedIndex].text}`); });
    byId("reduce-motion").addEventListener("change", (event) => { state.reduced = event.target.checked; document.body.classList.toggle("reduce-motion", state.reduced); toast(state.reduced ? "Reduced-motion pose enabled" : "Full motion enabled"); });
    byId("toggle-play").addEventListener("click", (event) => {
      state.paused = !state.paused;
      document.body.classList.toggle("is-paused", state.paused);
      event.currentTarget.setAttribute("aria-pressed", String(state.paused));
      event.currentTarget.setAttribute("aria-label", state.paused ? "Play animations" : "Pause animations");
      toast(state.paused ? "Animation paused" : "Animation playing");
    });
    byId("replay").addEventListener("click", () => { renderLoaders(); toast("Animations replayed"); });
    byId("motion-index").addEventListener("click", (event) => {
      const chip = event.target.closest("[data-motion]");
      if (!chip) return;
      state.motion = chip.dataset.motion;
      renderMotionIndex();
      renderLoaders();
    });
    document.querySelectorAll("[data-jump]").forEach((button) => button.addEventListener("click", () => {
      setView(button.dataset.jump, true);
      document.querySelector(".workbench").scrollIntoView({ behavior: "smooth" });
    }));
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[download]");
      if (link) toast(`Preparing ${link.getAttribute("download") || link.textContent.trim()}`);
    });
  }

  renderStatic();
  renderMotionIndex();
  renderBundles();
  initializeControls();
  setCanvasTheme(state.canvasTheme);
  setView(location.hash.replace("#", "") || "static", false);

  window.SOLICON = {
    data,
    state,
    previewSvg,
    mountAllLoaders() { document.querySelectorAll("[data-lazy-preview]").forEach(mountLoaderCard); },
    setView(view) { setView(view, false); },
  };
}());
