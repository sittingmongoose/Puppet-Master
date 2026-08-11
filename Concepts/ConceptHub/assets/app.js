(function () {
  "use strict";

  var STORAGE_KEY = "pm.conceptHub.v1";
  var HUB_VERSION = 2;
  var THEMES = ["friendly-dark", "friendly-light", "glass-dark", "glass-light", "retro-dark", "retro-light", "basic-dark", "basic-light"];
  var DEFAULT_GLOBAL = { theme: "friendly-dark", reducedMotion: false, cardWidth: 380 };
  var catalog = null;
  var rooms = new Map();
  var cards = new Map();
  var previewCards = new WeakMap();
  var resizeObserver = null;
  var previewObserver = null;
  var fitFrame = 0;
  var writeToken = "";
  var PREVIEW_LOAD_TIMEOUT = 15000;
  var MAX_PREVIEW_RETRIES = 2;

  var elements = {
    topicTabs: document.getElementById("topicTabs"),
    topicRooms: document.getElementById("topicRooms"),
    topicTitle: document.getElementById("topicTitle"),
    topicDescription: document.getElementById("topicDescription"),
    visibleCount: document.getElementById("visibleCount"),
    countLabel: document.getElementById("countLabel"),
    searchInput: document.getElementById("searchInput"),
    sortSelect: document.getElementById("sortSelect"),
    modelFilters: document.getElementById("modelFilters"),
    typeFilters: document.getElementById("typeFilters"),
    tagFilters: document.getElementById("tagFilters"),
    clearModels: document.getElementById("clearModels"),
    clearTypes: document.getElementById("clearTypes"),
    clearTags: document.getElementById("clearTags"),
    resetFilters: document.getElementById("resetFilters"),
    emptyState: document.getElementById("emptyState"),
    cardTemplate: document.getElementById("cardTemplate"),
    themeSelect: document.getElementById("themeSelect"),
    cardSize: document.getElementById("cardSize"),
    cardSizeReadout: document.getElementById("cardSizeReadout"),
    pageWidth: document.getElementById("pageWidth"),
    pageWidthReadout: document.getElementById("pageWidthReadout"),
    testWidthControl: document.getElementById("testWidthControl"),
    testWidthLabel: document.getElementById("testWidthLabel"),
    widthHelp: document.getElementById("widthHelp"),
    cardPresets: document.getElementById("cardPresets"),
    pagePresets: document.getElementById("pagePresets"),
    motionToggle: document.getElementById("motionToggle"),
    compareMode: document.getElementById("compareMode"),
    focusMode: document.getElementById("focusMode"),
    accessBadge: document.getElementById("accessBadge"),
    warningStrip: document.getElementById("warningStrip"),
    warningText: document.getElementById("warningText"),
    filterPanel: document.getElementById("filterPanel"),
    filterScrim: document.getElementById("filterScrim"),
    openFilters: document.getElementById("openFilters"),
    closeFilters: document.getElementById("closeFilters"),
    exitFocus: document.getElementById("exitFocus"),
    toastRegion: document.getElementById("toastRegion")
  };

  function defaultTopicState() {
    return { search: "", sort: "curated", models: [], types: [], tags: [], mode: "compare", focusUid: null, testWidth: null };
  }

  function loadState() {
    var stored = {};
    try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (_) { stored = {}; }
    var global = Object.assign({}, DEFAULT_GLOBAL, stored.global || {});
    if (THEMES.indexOf(global.theme) === -1) global.theme = DEFAULT_GLOBAL.theme;
    global.cardWidth = clamp(Number(global.cardWidth) || 380, 260, 680);
    global.reducedMotion = !!global.reducedMotion;
    var topics = stored.topics && typeof stored.topics === "object" ? stored.topics : {};
    if (Number(global.viewportWidth) && (!topics.usage || !Number(topics.usage.testWidth))) {
      topics.usage = Object.assign(defaultTopicState(), topics.usage || {}, { testWidth: Number(global.viewportWidth) });
    }
    delete global.viewportWidth;
    return { global: global, topics: topics, topic: stored.topic || "usage" };
  }

  var state = loadState();

  function topicState(topicId) {
    if (!state.topics[topicId]) state.topics[topicId] = defaultTopicState();
    var value = state.topics[topicId];
    if (typeof value.search !== "string") value.search = "";
    if (!Array.isArray(value.models)) value.models = [];
    if (!Array.isArray(value.types)) value.types = [];
    if (!Array.isArray(value.tags)) value.tags = [];
    if (!["curated", "model", "title", "recent"].includes(value.sort)) value.sort = "curated";
    if (!["compare", "focus"].includes(value.mode)) value.mode = "compare";
    return value;
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function pathUrl(folder, relative, embedded) {
    var pieces = String(folder + "/" + relative).split("/").filter(Boolean).map(encodeURIComponent);
    var url = "/concepts/" + pieces.join("/");
    // `embed=1` is a legacy gallery convention that may remove a concept's
    // surrounding shell. Hub previews must match the complete standalone page.
    if (embedded) url += (url.indexOf("?") === -1 ? "?" : "&") + "hub=1";
    return url;
  }

  function icon(name) {
    var paths = {
      check: '<path d="m5 12 4 4L19 6"/>',
      here: '<path d="M5 12h12M13 8l4 4-4 4"/>',
      external: '<path d="M14 4h6v6M20 4l-9 9M18 13v6H5V6h6"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (paths[name] || paths.here) + "</svg>";
  }

  function toast(message, isError) {
    var node = document.createElement("div");
    node.className = "toast" + (isError ? " is-error" : "");
    node.textContent = message;
    elements.toastRegion.appendChild(node);
    window.setTimeout(function () { node.remove(); }, 3600);
  }

  function allItemsForModel(model) {
    var items = [];
    if (model.presentation === "entries" || model.presentation === "hybrid") items = items.concat(model.entries || []);
    if ((model.presentation === "workspace" || model.presentation === "hybrid") && model.workspace) items.push(model.workspace);
    return items;
  }

  function topicModels(topicId) {
    return catalog.models.filter(function (model) { return model.topic === topicId; });
  }

  function topicCards(topicId) {
    return Array.from(cards.values()).filter(function (record) { return record.model.topic === topicId; });
  }

  function topicMeta(topicId) {
    return catalog.topics.find(function (topic) { return topic.id === topicId; }) || { id: topicId, label: topicId, description: "Concept collection" };
  }

  function widthProfile(topicId) {
    var fallback = { enabled: true, label: "App width", role: "page", min: 520, max: 1920, step: 10, default: 1280, presets: [520, 768, 1280, 1600, 1920], previewWidth: "test" };
    if (!catalog) return fallback;
    var profile = topicMeta(topicId).widthControl;
    return Object.assign({}, fallback, profile && typeof profile === "object" ? profile : {});
  }

  function currentTestWidth(topicId) {
    var profile = widthProfile(topicId);
    var current = topicState(topicId);
    var value = Number(current.testWidth);
    if (!value) value = Number(profile.default) || 1280;
    value = clamp(value, Number(profile.min) || 220, Number(profile.max) || 2500);
    current.testWidth = value;
    return value;
  }

  function previewCanvasWidth(record) {
    var profile = widthProfile(record.model.topic);
    var configured = record.item.previewWidth;
    if (configured === undefined || configured === null) configured = record.model.previewWidth;
    if (configured === undefined || configured === null) configured = profile.previewWidth;
    if (configured === "test") return currentTestWidth(record.model.topic);
    return clamp(Number(configured) || 1280, 320, 3000);
  }

  function widthRoleLabel(profile) {
    if (profile.role === "panel") return "panel";
    if (profile.role === "chat") return "chat";
    return profile.label ? String(profile.label).replace(/\s+width$/i, "").toLowerCase() : "page";
  }

  function renderTopicTabs() {
    elements.topicTabs.textContent = "";
    catalog.topics.forEach(function (topic) {
      var count = topicModels(topic.id).reduce(function (total, model) { return total + allItemsForModel(model).length; }, 0);
      var button = document.createElement("button");
      button.type = "button";
      button.className = "topic-tab";
      button.dataset.topic = topic.id;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", "false");
      button.innerHTML = '<span class="topic-name"></span><span class="topic-count"></span>';
      button.querySelector(".topic-name").textContent = topic.label;
      button.querySelector(".topic-count").textContent = String(count);
      button.addEventListener("click", function () {
        if (state.topic === topic.id) return;
        window.location.hash = topic.id;
      });
      elements.topicTabs.appendChild(button);
    });
  }

  function clearPreviewTimers(record) {
    ["verifyTimer", "timeoutTimer", "retryTimer"].forEach(function (name) {
      if (record[name]) window.clearTimeout(record[name]);
      record[name] = 0;
    });
  }

  function previewIsReady(record) {
    try {
      var expected = new URL(record.iframe.dataset.previewSrc, window.location.href);
      var current = new URL(record.iframe.contentWindow.location.href);
      var doc = record.iframe.contentDocument;
      return current.origin === expected.origin &&
        current.pathname === expected.pathname &&
        !!doc && !!doc.documentElement && !!doc.body &&
        doc.readyState !== "loading";
    } catch (_) {
      return false;
    }
  }

  function completePreviewLoad(record) {
    if (!record.loading || !previewIsReady(record)) return false;
    clearPreviewTimers(record);
    record.loading = false;
    record.loaded = true;
    record.retryCount = 0;
    record.element.classList.add("is-loaded");
    var error = record.element.querySelector(".preview-error");
    error.hidden = true;
    error.querySelector(".preview-retry").hidden = true;
    syncIframe(record);
    scheduleFitAll();
    window.setTimeout(function () { if (record.loaded) syncIframe(record); }, 280);
    window.setTimeout(function () { if (record.loaded) syncIframe(record); }, 1000);
    return true;
  }

  function failPreviewLoad(record, message) {
    if (!record.loading) return;
    clearPreviewTimers(record);
    record.loading = false;
    record.loaded = false;
    record.element.classList.add("is-loaded");
    var error = record.element.querySelector(".preview-error");
    var retry = error.querySelector(".preview-retry");
    error.hidden = false;
    if (record.retryCount < MAX_PREVIEW_RETRIES) {
      record.retryCount += 1;
      error.querySelector("strong").textContent = "Reconnecting preview";
      error.querySelector("span").textContent = "The local connection paused. Retrying automatically…";
      retry.hidden = true;
      record.retryTimer = window.setTimeout(function () {
        loadPreview(record, false);
      }, record.retryCount === 1 ? 350 : 900);
      return;
    }
    error.querySelector("strong").textContent = "Preview unavailable";
    error.querySelector("span").textContent = message || "The local server did not answer this preview.";
    retry.hidden = false;
  }

  function verifyPreviewLoad(record) {
    if (!record.loading) return;
    if (!completePreviewLoad(record)) {
      failPreviewLoad(record, "The local server reset this preview. Retry it, or reopen the Hub if several cards failed together.");
    }
  }

  function loadPreview(record, resetRetries) {
    if (!record || record.item.broken || record.loading || (record.loaded && !resetRetries)) return;
    clearPreviewTimers(record);
    if (resetRetries) record.retryCount = 0;
    record.loading = true;
    record.loaded = false;
    record.element.classList.remove("is-loaded");
    var error = record.element.querySelector(".preview-error");
    error.hidden = true;
    error.querySelector(".preview-retry").hidden = true;
    var url = record.iframe.dataset.previewSrc;
    if (record.retryCount) {
      url += (url.indexOf("?") === -1 ? "?" : "&") + "hubRetry=" + record.retryCount + "&t=" + Date.now();
    }
    record.iframe.src = url;
    record.verifyTimer = window.setTimeout(function () {
      if (record.loading && previewIsReady(record)) completePreviewLoad(record);
    }, 800);
    record.timeoutTimer = window.setTimeout(function () {
      failPreviewLoad(record, "The local server took too long to answer this preview.");
    }, PREVIEW_LOAD_TIMEOUT);
  }

  function ensurePreviewLoaded(record) {
    if (!record || record.item.broken || record.loaded || record.loading) return;
    if (previewObserver) previewObserver.unobserve(record.element);
    loadPreview(record, false);
  }

  function createPreviewObserver() {
    if (!("IntersectionObserver" in window)) return null;
    return new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        ensurePreviewLoaded(previewCards.get(entry.target));
      });
    }, { root: null, rootMargin: "900px 0px" });
  }

  function buildRoom(topicId) {
    if (rooms.has(topicId)) return rooms.get(topicId);
    var room = document.createElement("section");
    room.className = "topic-room";
    room.dataset.topic = topicId;
    room.hidden = true;
    elements.topicRooms.appendChild(room);
    rooms.set(topicId, room);
    topicModels(topicId).forEach(function (model) {
      allItemsForModel(model).forEach(function (item) {
        var record = buildCard(model, item);
        cards.set(item.uid, record);
        room.appendChild(record.element);
        if (!item.broken) {
          if (previewObserver) previewObserver.observe(record.element);
          else ensurePreviewLoaded(record);
        }
      });
    });
    return room;
  }

  function buildCard(model, item) {
    var fragment = elements.cardTemplate.content.cloneNode(true);
    var card = fragment.querySelector(".concept-card");
    var iframe = card.querySelector("iframe");
    var stage = card.querySelector(".preview-stage");
    card.dataset.uid = item.uid;
    card.dataset.modelId = model.id;
    card.dataset.controlMode = item.controlMode || "standard";
    card.style.order = String(curatedOrder(model, item));
    card.querySelector(".model-badge").textContent = model.displayModel;
    card.querySelector(".unknown-badge").hidden = !model.unknownModel;
    card.querySelector(".card-kind").textContent = item.kind === "workspace" ? "Model index / workspace" : "Concept";
    card.querySelector(".card-title").textContent = item.title;
    card.querySelector(".viewport-readout").textContent = "Fitting preview…";
    var tags = card.querySelector(".card-tags");
    (item.tags || []).forEach(function (tag) {
      var chip = document.createElement("span");
      chip.className = "card-tag";
      chip.textContent = tag;
      tags.appendChild(chip);
    });
    if (!(item.tags || []).length) tags.hidden = true;
    var notice = card.querySelector(".workspace-notice");
    notice.hidden = item.controlMode !== "internal";

    var editButton = card.querySelector(".edit-label");
    editButton.hidden = !catalog.canEdit;
    editButton.addEventListener("click", function () { startLabelEdit(model.id, card); });

    var focusButton = card.querySelector(".focus-card");
    focusButton.addEventListener("click", function () {
      if (card.classList.contains("is-focused")) setMode("compare");
      else focusItem(item.uid);
    });

    var actions = card.querySelector(".card-actions");
    var actionCount = 0;
    if (item.openActions !== "none" && !item.broken) {
      var openUrl = pathUrl(model.folder, item.openPath || item.path, false);
      actions.appendChild(openLink(openUrl, false));
      actions.appendChild(openLink(openUrl, true));
      actionCount += 2;
    }
    if (item.kind !== "workspace" && model.workspace && !model.workspace.broken) {
      actions.appendChild(workspaceLink(pathUrl(model.folder, model.workspace.openPath || model.workspace.path, false)));
      actionCount += 1;
    }
    actions.hidden = actionCount === 0;

    var record = {
      element: card,
      iframe: iframe,
      stage: stage,
      model: model,
      item: item,
      loaded: false,
      loading: false,
      retryCount: 0,
      verifyTimer: 0,
      timeoutTimer: 0,
      retryTimer: 0
    };
    previewCards.set(card, record);
    var retryButton = card.querySelector(".preview-retry");
    retryButton.addEventListener("click", function () { loadPreview(record, true); });

    if (item.broken) {
      card.classList.add("is-loaded");
      var error = card.querySelector(".preview-error");
      error.hidden = false;
      error.querySelector("span").textContent = item.problem || "The registered page could not be found.";
      retryButton.hidden = true;
      iframe.removeAttribute("src");
    } else {
      iframe.title = model.displayModel + " — " + item.title;
      iframe.dataset.previewSrc = pathUrl(model.folder, item.path, true);
      iframe.addEventListener("load", function () {
        if (!record.loading) return;
        if (!completePreviewLoad(record)) verifyPreviewLoad(record);
      });
      iframe.addEventListener("error", function () {
        failPreviewLoad(record, "The local server reset this preview before it loaded.");
      });
    }
    if (resizeObserver) resizeObserver.observe(stage);
    return record;
  }

  function openLink(url, newTab) {
    var link = document.createElement("a");
    link.className = "open-action" + (newTab ? " new-tab" : " this-tab");
    link.href = url;
    if (newTab) {
      link.target = "_blank";
      link.rel = "noopener";
      link.innerHTML = icon("external") + "<span>Open in new tab</span>";
    } else {
      link.innerHTML = icon("here") + "<span>Open in this tab</span>";
    }
    link.addEventListener("click", saveState);
    return link;
  }

  function workspaceLink(url) {
    var link = document.createElement("a");
    link.className = "open-action workspace-action";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    link.innerHTML = icon("external") + "<span>Model index</span>";
    link.addEventListener("click", saveState);
    return link;
  }

  function curatedOrder(model, item) {
    return (Number(model.order) || 1000) * 10000 + (Number(item.order) || 1000);
  }

  function proxyHit(record, event) {
    try {
      var scale = Number(record.iframe.dataset.previewScale) || 1;
      var offset = Number(record.iframe.dataset.previewOffset) || 0;
      var stageRect = record.stage.getBoundingClientRect();
      var x = (event.clientX - stageRect.left - offset) / scale;
      var y = (event.clientY - stageRect.top) / scale;
      var doc = record.iframe.contentDocument;
      return { target: doc && doc.elementFromPoint(x, y), x: x, y: y, view: record.iframe.contentWindow };
    } catch (_) {
      return { target: null, x: 0, y: 0, view: null };
    }
  }

  function relayPointer(type, original, hit, target) {
    if (!target || !hit.view) return;
    var init = {
      bubbles: true,
      cancelable: true,
      composed: true,
      clientX: hit.x,
      clientY: hit.y,
      screenX: original.screenX,
      screenY: original.screenY,
      button: original.button || 0,
      buttons: original.buttons || 0,
      ctrlKey: original.ctrlKey,
      shiftKey: original.shiftKey,
      altKey: original.altKey,
      metaKey: original.metaKey,
      pointerId: original.pointerId || 1,
      pointerType: original.pointerType || "mouse",
      isPrimary: original.isPrimary !== false,
      view: hit.view
    };
    try {
      var PointerCtor = hit.view.PointerEvent || hit.view.MouseEvent;
      target.dispatchEvent(new PointerCtor(type, init));
      if (type === "pointerdown" || type === "pointermove" || type === "pointerup") {
        target.dispatchEvent(new hit.view.MouseEvent(type.replace("pointer", "mouse"), init));
      }
    } catch (_) {}
  }

  function setProxyRange(target, hit, finalChange) {
    if (!target || target.tagName !== "INPUT" || target.type !== "range") return false;
    var rect = target.getBoundingClientRect();
    var minimum = Number(target.min || 0);
    var maximum = Number(target.max || 100);
    var step = Number(target.step || 1);
    var ratio = clamp((hit.x - rect.left) / Math.max(1, rect.width), 0, 1);
    var value = minimum + (maximum - minimum) * ratio;
    value = Math.round(value / step) * step;
    target.value = String(clamp(value, minimum, maximum));
    var EventCtor = hit.view.Event;
    target.dispatchEvent(new EventCtor("input", { bubbles: true }));
    if (finalChange) target.dispatchEvent(new EventCtor("change", { bubbles: true }));
    return true;
  }

  function scrollProxyTarget(target, hit, deltaX, deltaY) {
    if (!target || !hit.view) return;
    var doc = target.ownerDocument;
    var node = target;
    while (node && node !== doc.body && node !== doc.documentElement) {
      var style = hit.view.getComputedStyle(node);
      var canY = node.scrollHeight > node.clientHeight && /(auto|scroll)/.test(style.overflowY);
      var canX = node.scrollWidth > node.clientWidth && /(auto|scroll)/.test(style.overflowX);
      if (canX || canY) {
        node.scrollLeft += deltaX;
        node.scrollTop += deltaY;
        return;
      }
      node = node.parentElement;
    }
    var scroller = doc.scrollingElement || doc.documentElement;
    scroller.scrollLeft += deltaX;
    scroller.scrollTop += deltaY;
  }

  function wirePreviewProxy(record) {
    var proxy = record.proxy;
    var touchY = null;
    proxy.addEventListener("pointerdown", function (event) {
      event.preventDefault();
      var hit = proxyHit(record, event);
      record.proxyTarget = hit.target;
      touchY = event.pointerType === "touch" ? event.clientY : null;
      if (!hit.target) return;
      try { hit.target.focus({ preventScroll: true }); } catch (_) { try { hit.target.focus(); } catch (_) {} }
      setProxyRange(hit.target, hit, false);
      relayPointer("pointerdown", event, hit, hit.target);
      if (hit.target.tagName === "SELECT" && typeof hit.target.showPicker === "function") {
        try { hit.target.showPicker(); } catch (_) {}
      }
    });
    proxy.addEventListener("pointermove", function (event) {
      var hit = proxyHit(record, event);
      var target = record.proxyTarget || hit.target;
      if (record.proxyHover !== hit.target) {
        if (record.proxyHover) relayPointer("pointerout", event, hit, record.proxyHover);
        if (hit.target) relayPointer("pointerover", event, hit, hit.target);
        record.proxyHover = hit.target;
      }
      if (target) {
        setProxyRange(target, hit, false);
        relayPointer("pointermove", event, hit, target);
        try { proxy.style.cursor = hit.view.getComputedStyle(hit.target).cursor || "default"; } catch (_) { proxy.style.cursor = "default"; }
      }
      if (event.pointerType === "touch" && touchY !== null && target && !target.closest("button,a,input,select,textarea,[role='button'],[role='slider']")) {
        scrollProxyTarget(target, hit, 0, touchY - event.clientY);
        touchY = event.clientY;
      }
    });
    proxy.addEventListener("pointerup", function (event) {
      var hit = proxyHit(record, event);
      var target = record.proxyTarget || hit.target;
      if (target) {
        setProxyRange(target, hit, true);
        relayPointer("pointerup", event, hit, target);
      }
      record.proxyTarget = null;
      touchY = null;
    });
    proxy.addEventListener("pointercancel", function () { record.proxyTarget = null; touchY = null; });
    proxy.addEventListener("click", function (event) {
      event.preventDefault();
      var hit = proxyHit(record, event);
      var target = hit.target;
      if (!target || (target.tagName === "INPUT" && target.type === "range")) return;
      try { target.click(); } catch (_) { relayPointer("click", event, hit, target); }
    });
    proxy.addEventListener("dblclick", function (event) {
      event.preventDefault();
      var hit = proxyHit(record, event);
      if (hit.target) relayPointer("dblclick", event, hit, hit.target);
    });
    proxy.addEventListener("wheel", function (event) {
      event.preventDefault();
      var hit = proxyHit(record, event);
      scrollProxyTarget(hit.target, hit, event.deltaX / (Number(record.iframe.dataset.previewScale) || 1), event.deltaY / (Number(record.iframe.dataset.previewScale) || 1));
    }, { passive: false });
  }

  function fitRecord(record) {
    if (!record || !record.iframe || !record.stage || record.item.broken) return;
    var stageWidth = record.stage.clientWidth;
    var stageHeight = record.stage.clientHeight;
    if (!stageWidth || !stageHeight) return;
    var profile = widthProfile(record.model.topic);
    var focused = record.element.classList.contains("is-focused");
    var previewSetting = record.item.previewWidth;
    if (previewSetting === undefined || previewSetting === null) previewSetting = record.model.previewWidth;
    if (previewSetting === undefined || previewSetting === null) previewSetting = profile.previewWidth;
    var exactPageWidth = previewSetting === "test" && record.item.kind !== "workspace";
    var canvasWidth = focused && !exactPageWidth ? stageWidth : previewCanvasWidth(record);
    var scale = focused && !exactPageWidth ? 1 : Math.min(1, stageWidth / canvasWidth);
    scale = Math.max(.08, scale);
    var renderedWidth = canvasWidth * scale;
    var offset = Math.max(0, Math.round((stageWidth - renderedWidth) / 2));
    record.iframe.style.width = Math.round(canvasWidth) + "px";
    // Match the transformed iframe to the visible stage. A taller minimum is
    // clipped here and hides fixed top or bottom chrome at near-live scale.
    record.iframe.style.height = Math.max(1, Math.ceil(stageHeight / scale)) + "px";
    record.iframe.dataset.previewScale = String(scale);
    record.iframe.dataset.previewOffset = String(offset);
    record.iframe.style.left = "0px";
    record.iframe.style.zoom = "1";
    record.iframe.style.transform = "translate3d(" + offset + "px, 0, 0) scale(" + scale + ")";
    var readout = Math.round(canvasWidth) + "px canvas";
    if (profile.enabled !== false) {
      var testWidth = currentTestWidth(record.model.topic);
      if (profile.role === "page" && exactPageWidth) readout = testWidth + "px " + widthRoleLabel(profile);
      else readout += " · " + testWidth + "px " + widthRoleLabel(profile);
    }
    if (scale < .995) readout += " · " + Math.round(scale * 100) + "% fit";
    else if (focused) readout += " · live size";
    record.element.querySelector(".viewport-readout").textContent = readout;
  }

  function scheduleFitAll() {
    window.cancelAnimationFrame(fitFrame);
    fitFrame = window.requestAnimationFrame(function () {
      cards.forEach(function (record) {
        if (!record.element.hidden && !rooms.get(record.model.topic).hidden) fitRecord(record);
      });
    });
  }

  function standardStateMessage(record) {
    var profile = widthProfile(record.model.topic);
    var testWidth = currentTestWidth(record.model.topic);
    var childState = {
      theme: state.global.theme,
      reducedMotion: state.global.reducedMotion,
      testWidth: testWidth,
      widthRole: profile.role
    };
    if (profile.role === "page") childState.viewportWidth = testWidth;
    return {
      source: "pm-concept-hub",
      type: "pm-concept-state",
      version: 1,
      state: childState
    };
  }

  function setInputValue(win, selector, value) {
    try {
      var input = win.document.querySelector(selector);
      if (!input) return false;
      input.value = String(value);
      input.dispatchEvent(new win.Event("input", { bubbles: true }));
      input.dispatchEvent(new win.Event("change", { bubbles: true }));
      return true;
    } catch (_) {
      return false;
    }
  }

  function applyKnownWidth(win, profile, value) {
    try {
      if (profile.role === "page") {
        if (win.__gal && typeof win.__gal.setWidth === "function") win.__gal.setWidth(value);
      } else if (profile.role === "panel") {
        if (win.SPProto && typeof win.SPProto.setWidth === "function") win.SPProto.setWidth(value);
        if (win.PROTO_PICKER && typeof win.PROTO_PICKER.setWidth === "function") win.PROTO_PICKER.setWidth(value);
        if (typeof win.__ppSetWidth === "function") win.__ppSetWidth(value);
        if (typeof win.setW === "function") win.setW(value);
        setInputValue(win, "#gWr", value);
        setInputValue(win, "#galWidth", value);
      } else if (profile.role === "chat") {
        if (win.__gal && typeof win.__gal.setChatWidth === "function") win.__gal.setChatWidth(value);
        if (win.PMXWorkspace && win.PMXWorkspace.store && typeof win.PMXWorkspace.store.set === "function") {
          win.PMXWorkspace.store.set("ui.chatWidth", value);
        }
        setInputValue(win, "#k3ws-width", value);
        setInputValue(win, "#gSlider", value);
        setInputValue(win, "#galWidth", value);
      }
    } catch (_) {}
  }

  function applyStateToWindow(win, record) {
    var profile = widthProfile(record.model.topic);
    var testWidth = currentTestWidth(record.model.topic);
    try {
      var doc = win.document;
      if (doc && doc.documentElement) {
        doc.documentElement.setAttribute("data-theme", state.global.theme);
        doc.documentElement.setAttribute("data-reduced-motion", state.global.reducedMotion ? "1" : "0");
        doc.documentElement.setAttribute("data-motion", state.global.reducedMotion ? "reduced" : "full");
        doc.documentElement.style.colorScheme = /-dark$/.test(state.global.theme) ? "dark" : "light";
        if (doc.body) doc.body.setAttribute("data-reduced", state.global.reducedMotion ? "1" : "0");
      }
    } catch (_) {}
    try {
      win.postMessage(standardStateMessage(record), "*");
      win.postMessage({ type: "pm-theme", theme: state.global.theme }, "*");
      win.postMessage({ type: "pm-rm", on: state.global.reducedMotion }, "*");
      win.postMessage({ pm: "pm-theme", theme: state.global.theme }, "*");
      win.postMessage({ pm: "pm-rm", on: state.global.reducedMotion }, "*");
      if (profile.role === "page" || profile.role === "panel") {
        win.postMessage({ type: "pm-setw", w: testWidth }, "*");
      } else if (profile.role === "chat") {
        win.postMessage({ type: "pm-chat-width", px: testWidth }, "*");
        win.postMessage({ pm: "pm-chat-width", px: testWidth }, "*");
        win.postMessage({ k3: true, type: "k3-env", env: { theme: state.global.theme, width: testWidth, reducedMotion: state.global.reducedMotion } }, "*");
      }
    } catch (_) {}
    applyKnownWidth(win, profile, testWidth);
  }

  function visitFrameWindows(frame, callback) {
    var seen = [];
    function visit(win, depth) {
      if (!win || depth > 4 || seen.indexOf(win) !== -1) return;
      seen.push(win);
      callback(win);
      try {
        Array.prototype.forEach.call(win.document.querySelectorAll("iframe"), function (child) {
          if (child.contentWindow) visit(child.contentWindow, depth + 1);
        });
      } catch (_) {}
    }
    try { visit(frame.contentWindow, 0); } catch (_) {}
  }

  function syncIframe(record) {
    if (!record || record.item.broken || !record.loaded) return;
    visitFrameWindows(record.iframe, function (win) { applyStateToWindow(win, record); });
  }

  function syncStandardFrames() {
    cards.forEach(syncIframe);
  }

  function configureWidthControl() {
    if (!catalog) return;
    var profile = widthProfile(state.topic);
    elements.testWidthControl.hidden = profile.enabled === false;
    if (profile.enabled === false) {
      elements.widthHelp.textContent = "Preview size changes the room. This collection keeps its own workspace sizing controls.";
      return;
    }
    var value = currentTestWidth(state.topic);
    elements.testWidthLabel.textContent = String(profile.label || "Test width").toUpperCase();
    elements.pageWidth.min = String(Number(profile.min) || 220);
    elements.pageWidth.max = String(Number(profile.max) || 2500);
    elements.pageWidth.step = String(Number(profile.step) || 1);
    elements.pageWidth.value = String(value);
    elements.pageWidth.setAttribute("aria-label", String(profile.label || "Test width"));
    elements.pageWidthReadout.value = String(value);
    elements.pageWidthReadout.textContent = String(value);
    var presets = Array.isArray(profile.presets) ? profile.presets : [];
    var signature = state.topic + ":" + presets.join(",");
    if (elements.pagePresets.dataset.signature !== signature) {
      elements.pagePresets.textContent = "";
      presets.forEach(function (preset) {
        var button = document.createElement("button");
        button.type = "button";
        button.dataset.pageWidth = String(preset);
        button.textContent = String(preset);
        elements.pagePresets.appendChild(button);
      });
      elements.pagePresets.dataset.signature = signature;
    }
    elements.widthHelp.textContent = "Preview size changes the room. " + (profile.label || "Test width") + " changes the " + widthRoleLabel(profile) + " inside these concepts; it does not resize the Hub card.";
  }

  function applyGlobalState() {
    document.documentElement.dataset.theme = state.global.theme;
    document.documentElement.dataset.reducedMotion = state.global.reducedMotion ? "1" : "0";
    document.documentElement.style.colorScheme = /-dark$/.test(state.global.theme) ? "dark" : "light";
    document.documentElement.style.setProperty("--card-width", state.global.cardWidth + "px");
    document.documentElement.style.setProperty("--preview-height", Math.round(clamp(state.global.cardWidth * .64, 190, 430)) + "px");
    elements.themeSelect.value = state.global.theme;
    elements.cardSize.value = String(state.global.cardWidth);
    elements.cardSizeReadout.value = String(state.global.cardWidth);
    elements.cardSizeReadout.textContent = String(state.global.cardWidth);
    configureWidthControl();
    elements.motionToggle.setAttribute("aria-pressed", String(state.global.reducedMotion));
    updatePresets();
    saveState();
    scheduleFitAll();
    syncStandardFrames();
  }

  function updatePresets() {
    elements.cardPresets.querySelectorAll("button").forEach(function (button) {
      button.classList.toggle("is-active", Number(button.dataset.cardWidth) === state.global.cardWidth);
    });
    var value = catalog ? currentTestWidth(state.topic) : null;
    elements.pagePresets.querySelectorAll("button").forEach(function (button) {
      button.classList.toggle("is-active", Number(button.dataset.pageWidth) === value);
    });
  }

  function renderFilters(topicId) {
    var current = topicState(topicId);
    var records = topicCards(topicId);
    var models = topicModels(topicId);
    elements.modelFilters.textContent = "";
    models.forEach(function (model) {
      var count = records.filter(function (record) { return record.model.id === model.id; }).length;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "filter-chip";
      button.dataset.modelId = model.id;
      button.setAttribute("aria-pressed", String(current.models.includes(model.id)));
      button.innerHTML = '<span class="filter-check">' + icon("check") + '</span><span class="filter-chip-name"></span><span class="filter-chip-count"></span>';
      button.querySelector(".filter-chip-name").textContent = model.displayModel;
      button.querySelector(".filter-chip-count").textContent = String(count);
      button.addEventListener("click", function () {
        current.models = toggleValue(current.models, model.id);
        button.setAttribute("aria-pressed", String(current.models.includes(model.id)));
        saveState();
        applyFilters();
      });
      elements.modelFilters.appendChild(button);
    });

    elements.typeFilters.textContent = "";
    [{ id: "concept", label: "Concept" }, { id: "workspace", label: "Workspace" }].forEach(function (type) {
      var count = records.filter(function (record) { return record.item.kind === type.id; }).length;
      if (!count) return;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "filter-chip";
      button.dataset.type = type.id;
      button.setAttribute("aria-pressed", String(current.types.includes(type.id)));
      button.innerHTML = '<span class="filter-check">' + icon("check") + '</span><span class="filter-chip-name"></span><span class="filter-chip-count"></span>';
      button.querySelector(".filter-chip-name").textContent = type.label;
      button.querySelector(".filter-chip-count").textContent = String(count);
      button.addEventListener("click", function () {
        current.types = toggleValue(current.types, type.id);
        button.setAttribute("aria-pressed", String(current.types.includes(type.id)));
        saveState();
        applyFilters();
      });
      elements.typeFilters.appendChild(button);
    });

    var tagCounts = {};
    records.forEach(function (record) {
      (record.item.tags || []).forEach(function (tag) { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });
    });
    elements.tagFilters.textContent = "";
    Object.keys(tagCounts).sort().forEach(function (tag) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "tag-filter";
      button.dataset.tag = tag;
      button.setAttribute("aria-pressed", String(current.tags.includes(tag)));
      button.textContent = tag + " · " + tagCounts[tag];
      button.addEventListener("click", function () {
        current.tags = toggleValue(current.tags, tag);
        button.setAttribute("aria-pressed", String(current.tags.includes(tag)));
        saveState();
        applyFilters();
      });
      elements.tagFilters.appendChild(button);
    });
  }

  function toggleValue(values, value) {
    return values.includes(value) ? values.filter(function (item) { return item !== value; }) : values.concat(value);
  }

  function searchText(record) {
    return [record.item.title, record.model.displayModel, record.model.folderName].concat(record.item.tags || []).join(" ").toLowerCase();
  }

  function sortValue(record, mode) {
    if (mode === "model") return record.model.displayModel.toLowerCase() + "\u0000" + record.item.title.toLowerCase();
    if (mode === "title") return record.item.title.toLowerCase();
    if (mode === "recent") return record.item.modified || "";
    return curatedOrder(record.model, record.item);
  }

  function applyFilters() {
    if (!catalog) return;
    var current = topicState(state.topic);
    var query = current.search.trim().toLowerCase();
    var visible = [];
    var records = topicCards(state.topic);
    var sorted = records.slice().sort(function (a, b) {
      var av = sortValue(a, current.sort);
      var bv = sortValue(b, current.sort);
      if (current.sort === "recent") return String(bv).localeCompare(String(av));
      if (typeof av === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
    var rank = new Map(sorted.map(function (record, index) { return [record.item.uid, index]; }));
    records.forEach(function (record) {
      var modelMatch = !current.models.length || current.models.includes(record.model.id);
      var typeMatch = !current.types.length || current.types.includes(record.item.kind);
      var tagMatch = !current.tags.length || current.tags.every(function (tag) { return (record.item.tags || []).includes(tag); });
      var queryMatch = !query || searchText(record).includes(query);
      var show = modelMatch && typeMatch && tagMatch && queryMatch;
      record.element.hidden = !show;
      record.element.style.order = String(rank.get(record.item.uid));
      if (show) visible.push(record);
    });
    elements.visibleCount.textContent = String(visible.length);
    elements.countLabel.textContent = visible.length === 1 ? "concept visible" : "concepts visible";
    elements.emptyState.hidden = visible.length !== 0;
    if (current.mode === "focus") {
      var focused = current.focusUid && cards.get(current.focusUid);
      if (!focused || focused.element.hidden || focused.model.topic !== state.topic) {
        current.focusUid = visible.length ? visible[0].item.uid : null;
      }
      applyMode();
    }
    scheduleFitAll();
  }

  function setTopic(topicId) {
    if (!catalog.topics.some(function (topic) { return topic.id === topicId; })) topicId = catalog.topics[0].id;
    state.topic = topicId;
    var room = buildRoom(topicId);
    rooms.forEach(function (value, key) { value.hidden = key !== topicId; });
    elements.topicTabs.querySelectorAll(".topic-tab").forEach(function (tab) {
      var active = tab.dataset.topic === topicId;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    var meta = topicMeta(topicId);
    elements.topicTitle.textContent = meta.label;
    elements.topicDescription.textContent = meta.description;
    var current = topicState(topicId);
    elements.searchInput.value = current.search;
    elements.sortSelect.value = current.sort;
    configureWidthControl();
    updatePresets();
    renderFilters(topicId);
    applyFilters();
    applyMode();
    saveState();
    if (window.location.hash.slice(1) !== topicId) history.replaceState(null, "", "#" + topicId);
    room.setAttribute("aria-label", meta.label + " concepts");
  }

  function setMode(mode) {
    var current = topicState(state.topic);
    current.mode = mode;
    if (mode === "focus" && !current.focusUid) {
      var first = topicCards(state.topic).find(function (record) { return !record.element.hidden; });
      current.focusUid = first ? first.item.uid : null;
    }
    applyMode();
    saveState();
  }

  function focusItem(uid) {
    var record = cards.get(uid);
    if (!record) return;
    state.topic = record.model.topic;
    var current = topicState(state.topic);
    current.focusUid = uid;
    current.mode = "focus";
    applyMode();
    saveState();
  }

  function applyMode() {
    var current = topicState(state.topic);
    var activeUid = current.mode === "focus" ? current.focusUid : null;
    cards.forEach(function (record) {
      var active = record.item.uid === activeUid && record.model.topic === state.topic;
      if (active) ensurePreviewLoaded(record);
      record.element.classList.toggle("is-focused", active);
      var button = record.element.querySelector(".focus-card");
      button.setAttribute("aria-label", active ? "Exit Focus and return to comparison" : "Focus concept");
      button.querySelector("span").textContent = active ? "Exit Focus" : "Focus";
      button.querySelector("svg").innerHTML = active ? '<path d="m6 6 12 12M18 6 6 18"/>' : '<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/>';
    });
    var focusActive = current.mode === "focus" && !!activeUid;
    document.body.classList.toggle("focus-mode", focusActive);
    elements.exitFocus.hidden = !focusActive;
    elements.compareMode.classList.toggle("is-active", current.mode === "compare");
    elements.focusMode.classList.toggle("is-active", current.mode === "focus");
    elements.compareMode.setAttribute("aria-pressed", String(current.mode === "compare"));
    elements.focusMode.setAttribute("aria-pressed", String(current.mode === "focus"));
    scheduleFitAll();
    window.setTimeout(scheduleFitAll, 260);
  }

  function resetFilters() {
    var current = topicState(state.topic);
    current.search = "";
    current.models = [];
    current.types = [];
    current.tags = [];
    elements.searchInput.value = "";
    renderFilters(state.topic);
    saveState();
    applyFilters();
  }

  function startLabelEdit(modelId, card) {
    var model = catalog.models.find(function (item) { return item.id === modelId; });
    if (!model || !catalog.canEdit) return;
    var line = card.querySelector(".model-line");
    if (line.querySelector(".label-form")) return;
    line.querySelector(".model-badge").hidden = true;
    line.querySelector(".unknown-badge").hidden = true;
    line.querySelector(".edit-label").hidden = true;
    var form = document.createElement("form");
    form.className = "label-form";
    var input = document.createElement("input");
    input.value = model.displayModel;
    input.maxLength = 80;
    input.setAttribute("aria-label", "Model display label");
    var save = document.createElement("button");
    save.type = "submit";
    save.textContent = "Save";
    var cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = "Cancel";
    form.append(input, save, cancel);
    line.appendChild(form);
    function close() {
      form.remove();
      line.querySelector(".model-badge").hidden = false;
      line.querySelector(".unknown-badge").hidden = !model.unknownModel;
      line.querySelector(".edit-label").hidden = !catalog.canEdit;
    }
    cancel.addEventListener("click", close);
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      var label = input.value.trim();
      if (!label) { toast("Enter a model label before saving.", true); input.focus(); return; }
      save.disabled = true;
      try {
        var response = await fetch("/api/labels", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Concept-Hub-Token": writeToken },
          body: JSON.stringify({ modelId: modelId, label: label })
        });
        var payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "The label could not be saved.");
        model.displayModel = payload.label;
        model.unknownModel = false;
        cards.forEach(function (record) {
          if (record.model.id === modelId) {
            record.model.displayModel = payload.label;
            record.model.unknownModel = false;
            record.element.querySelector(".model-badge").textContent = payload.label;
            record.element.querySelector(".unknown-badge").hidden = true;
            record.iframe.title = payload.label + " — " + record.item.title;
          }
        });
        close();
        renderFilters(state.topic);
        applyFilters();
        toast("Model label saved for every concept in this folder.");
      } catch (error) {
        save.disabled = false;
        toast(error.message || "The label could not be saved.", true);
      }
    });
    input.focus();
    input.select();
  }

  function openFilters(open) {
    elements.filterPanel.classList.toggle("is-open", open);
    elements.filterScrim.hidden = !open;
    if (open) elements.closeFilters.focus();
  }

  function setTestWidth(value) {
    if (!catalog) return;
    var profile = widthProfile(state.topic);
    topicState(state.topic).testWidth = clamp(Number(value), Number(profile.min) || 220, Number(profile.max) || 2500);
    configureWidthControl();
    updatePresets();
    saveState();
    scheduleFitAll();
    topicCards(state.topic).forEach(syncIframe);
  }

  function wireControls() {
    elements.themeSelect.addEventListener("change", function () { state.global.theme = this.value; applyGlobalState(); });
    elements.cardSize.addEventListener("input", function () { state.global.cardWidth = clamp(Number(this.value), 260, 680); applyGlobalState(); });
    elements.pageWidth.addEventListener("input", function () { setTestWidth(this.value); });
    elements.cardPresets.addEventListener("click", function (event) {
      var button = event.target.closest("[data-card-width]");
      if (!button) return;
      state.global.cardWidth = Number(button.dataset.cardWidth);
      applyGlobalState();
    });
    elements.pagePresets.addEventListener("click", function (event) {
      var button = event.target.closest("[data-page-width]");
      if (!button) return;
      setTestWidth(button.dataset.pageWidth);
    });
    elements.motionToggle.addEventListener("click", function () { state.global.reducedMotion = !state.global.reducedMotion; applyGlobalState(); });
    elements.compareMode.addEventListener("click", function () { setMode("compare"); });
    elements.focusMode.addEventListener("click", function () { setMode("focus"); });
    elements.exitFocus.addEventListener("click", function () { setMode("compare"); });
    elements.searchInput.addEventListener("input", function () { var current = topicState(state.topic); current.search = this.value; saveState(); applyFilters(); });
    elements.sortSelect.addEventListener("change", function () { var current = topicState(state.topic); current.sort = this.value; saveState(); applyFilters(); });
    elements.clearModels.addEventListener("click", function () { topicState(state.topic).models = []; renderFilters(state.topic); saveState(); applyFilters(); });
    elements.clearTypes.addEventListener("click", function () { topicState(state.topic).types = []; renderFilters(state.topic); saveState(); applyFilters(); });
    elements.clearTags.addEventListener("click", function () { topicState(state.topic).tags = []; renderFilters(state.topic); saveState(); applyFilters(); });
    elements.resetFilters.addEventListener("click", resetFilters);
    elements.openFilters.addEventListener("click", function () { openFilters(true); });
    elements.closeFilters.addEventListener("click", function () { openFilters(false); });
    elements.filterScrim.addEventListener("click", function () { openFilters(false); });
    window.addEventListener("hashchange", function () { setTopic(window.location.hash.slice(1)); });
    window.addEventListener("resize", scheduleFitAll);
    window.addEventListener("pageshow", function (event) {
      if (event.persisted) window.location.reload();
    });
    window.addEventListener("pagehide", saveState);
    window.addEventListener("message", function (event) {
      var message = event.data;
      if (!message || typeof message !== "object") return;
      if (message.type === "pm-ready" || message.type === "pm-concept-ready" || message.pm === "pm-ready") {
        cards.forEach(function (record) { if (record.iframe.contentWindow === event.source) syncIframe(record); });
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        if (elements.filterPanel.classList.contains("is-open")) openFilters(false);
        else if (document.body.classList.contains("focus-mode")) setMode("compare");
      }
    });
  }

  async function boot() {
    wireControls();
    applyGlobalState();
    var health = null;
    try {
      var healthResponse = await fetch("/api/health?client=" + HUB_VERSION, { cache: "no-store" });
      if (healthResponse.ok) health = await healthResponse.json();
    } catch (_) {}
    try {
      var response = await fetch("/api/catalog", { cache: "no-store" });
      if (!response.ok) throw new Error("Catalog request failed with " + response.status);
      catalog = await response.json();
    } catch (error) {
      elements.topicDescription.textContent = "The Concept Hub catalog could not be loaded.";
      elements.warningStrip.hidden = false;
      elements.warningText.textContent = error.message;
      elements.accessBadge.textContent = "Catalog unavailable";
      return;
    }
    writeToken = catalog.writeToken || "";
    elements.accessBadge.textContent = catalog.canEdit ? "Mac · labels editable" : "LAN · read only";
    elements.accessBadge.classList.toggle("can-edit", !!catalog.canEdit);
    var warnings = [];
    if (!health || Number(health.version) !== HUB_VERSION) {
      warnings.push("This tab is connected to an older Concept Hub server. Double-click StartConceptHub.command to open the current server on a free port.");
    }
    if (catalog.warnings && catalog.warnings.length) {
      warnings.push(catalog.warnings.length + " catalog warning" + (catalog.warnings.length === 1 ? "" : "s") + ". Broken entries remain visible for repair.");
    }
    if (warnings.length) {
      elements.warningStrip.hidden = false;
      elements.warningText.textContent = warnings.join(" ");
      elements.warningStrip.title = (catalog.warnings || []).join("\n");
    }
    resizeObserver = new ResizeObserver(scheduleFitAll);
    previewObserver = createPreviewObserver();
    renderTopicTabs();
    var requested = window.location.hash.slice(1) || state.topic;
    setTopic(requested);
    applyGlobalState();
  }

  boot();
})();
