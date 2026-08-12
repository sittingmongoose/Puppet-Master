/**
 * Semantic motion runtime for the 5.6 Sol Settings bakeoff.
 *
 * The coordinator deliberately owns no product state. Callers commit their DOM
 * update, then this module animates the resulting semantic landmarks. The same
 * kind/role/stage vocabulary can be mapped to temporary proxy components in a
 * future Slint implementation without carrying browser geometry into state.
 *
 * Authoring contract:
 *   data-motion-region="workspace"
 *   data-motion-role="address document inspector"
 *   data-motion-key="setting.appearance.theme"
 *   data-motion-stage="optional-author-stage"
 *
 * Typical use:
 *   const motion = createMotionCoordinator({
 *     root: document.querySelector("#app"),
 *     getReducedMotion: () => store.state.reducedMotion
 *   });
 *   await motion.run({
 *     kind: "navigate",
 *     region: "workspace",
 *     key: categoryId,
 *     commit: renderWorkspace,
 *     waitFor: () => controlledScrollPromise,
 *     viewTransition: true
 *   });
 *
 * For FLIP reorders, capture before committing and pass the Map as beforeRects:
 *   const beforeRects = captureMotionRects(root);
 *   await motion.run({ kind: "reorder", beforeRects, commit: renderRows });
 */

export const MOTION_KINDS = Object.freeze([
  "navigate",
  "category",
  "search",
  "jump",
  "scrollspy",
  "disclosure",
  "refresh",
  "save",
  "reorder",
  "drawer",
  "transaction",
  "preview"
]);

const KIND_SET = new Set(MOTION_KINDS);
const EASE_OUT_QUART = "cubic-bezier(0.25, 1, 0.5, 1)";
const EASE_OUT_QUINT = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";
const MAX_STAGGER_MS = 180;
const MAX_STAGGERED_ITEMS = 6;

const step = (role, stage, effect, options = {}) => Object.freeze({
  role,
  stage,
  effect,
  pace: options.pace || "local",
  delay: options.delay || 0,
  origin: options.origin || null,
  opacity: options.opacity
});

/**
 * Public, Slint-portable choreography vocabulary. It describes intent, order,
 * and pace without encoding CSS selectors or product state.
 */
export const MOTION_BLUEPRINTS = Object.freeze({
  "index-house": Object.freeze({
    timing: Object.freeze({ major: 320, local: 210, feedback: 110 }),
    reducedRole: "address-marker",
    navigate: Object.freeze([
      step("address", "address", "rise", { pace: "major" }),
      step("directory", "directory", "from-start", { pace: "major", delay: 35 }),
      step("document", "document", "rise", { pace: "major", delay: 70 }),
      step("inspector", "inspector", "from-end", { pace: "major", delay: 105 })
    ]),
    category: Object.freeze([
      step("address", "address", "rise", { pace: "major" }),
      step("document", "document", "rise", { pace: "major", delay: 45 }),
      step("inspector", "inspector", "from-end", { pace: "major", delay: 85 })
    ]),
    search: Object.freeze([step("search-result", "results", "from-start")]),
    jump: Object.freeze([
      step("address-marker", "address", "latch", { pace: "feedback" }),
      step("section", "destination", "focus", { delay: 35 })
    ]),
    scrollspy: Object.freeze([
      step("address-marker", "address", "latch", { pace: "feedback" }),
      step("inspector-field", "inspector", "crossfade", { pace: "feedback", delay: 20 })
    ]),
    disclosure: Object.freeze([step("disclosure", "records", "rise")]),
    refresh: Object.freeze([
      step("source", "source", "focus", { pace: "feedback" }),
      step("catalogue", "catalogue", "rise", { delay: 45 }),
      step("evidence", "evidence", "from-end", { delay: 90 })
    ]),
    save: Object.freeze([step("setting", "saved", "latch", { pace: "feedback" })]),
    reorder: Object.freeze([step("reorder-item", "settled", "focus", { pace: "feedback" })]),
    drawer: Object.freeze([
      step("drawer-backdrop", "backdrop", "crossfade", { pace: "feedback" }),
      step("drawer", "directory", "from-start", { pace: "major", delay: 20 })
    ]),
    transaction: Object.freeze([
      step("address", "transaction-address", "rise", { pace: "feedback" }),
      step("transaction", "evidence-unfold", "rise", { delay: 35 }),
      step("inspector-field", "receipt-index", "from-end", { delay: 80 })
    ]),
    preview: Object.freeze([
      step("preview", "sample-mounted", "crossfade", { pace: "feedback" }),
      step("document", "semantic-preview", "focus", { delay: 45 })
    ])
  }),
  switchboard: Object.freeze({
    timing: Object.freeze({ major: 280, local: 180, feedback: 100 }),
    reducedRole: "signal-marker",
    navigate: Object.freeze([
      step("signal", "routing", "line-x", { pace: "major", origin: "0 50%" }),
      step("station", "latched", "latch", { delay: 65 }),
      step("board", "online", "rise", { pace: "major", delay: 100 })
    ]),
    category: Object.freeze([
      step("signal", "routing", "line-x", { pace: "major", origin: "0 50%" }),
      step("station", "latched", "latch", { delay: 55 }),
      step("board", "online", "rise", { pace: "major", delay: 90 })
    ]),
    search: Object.freeze([step("search-result", "signals", "rise")]),
    jump: Object.freeze([
      step("signal-marker", "routing", "line-y", { origin: "50% 0" }),
      step("station", "latched", "latch", { pace: "feedback", delay: 45 })
    ]),
    scrollspy: Object.freeze([
      step("signal-marker", "latched", "latch", { pace: "feedback" }),
      step("instrument", "effective", "crossfade", { pace: "feedback", delay: 20 })
    ]),
    disclosure: Object.freeze([
      step("signal", "routed", "line-x", { origin: "0 50%" }),
      step("disclosure", "online", "rise", { delay: 35 })
    ]),
    refresh: Object.freeze([
      step("connection", "connection", "latch", { pace: "feedback" }),
      step("catalogue", "catalogue", "line-x", { delay: 45, origin: "0 50%" }),
      step("readiness", "readiness", "latch", { delay: 90 })
    ]),
    save: Object.freeze([step("instrument", "effective", "latch", { pace: "feedback" })]),
    reorder: Object.freeze([step("reorder-item", "latched", "latch", { pace: "feedback" })]),
    drawer: Object.freeze([
      step("drawer-backdrop", "backdrop", "crossfade", { pace: "feedback" }),
      step("drawer", "station", "from-start", { pace: "major", delay: 20 })
    ]),
    transaction: Object.freeze([
      step("signal", "route-armed", "line-x", { pace: "major", origin: "0 50%" }),
      step("transaction", "verification-bay", "latch", { delay: 45 }),
      step("instrument", "receipt-latched", "latch", { pace: "feedback", delay: 90 })
    ]),
    preview: Object.freeze([
      step("signal", "preview-signal", "line-x", { pace: "feedback", origin: "0 50%" }),
      step("preview", "monitor-online", "latch", { delay: 40 })
    ])
  }),
  wayfinder: Object.freeze({
    timing: Object.freeze({ major: 390, local: 230, feedback: 115 }),
    reducedRole: "waypoint-current",
    navigate: Object.freeze([
      step("route-line", "route", "line-x", { pace: "major", origin: "0 50%" }),
      step("waypoint", "waypoint", "latch", { delay: 75 }),
      step("checkpoint", "checkpoint", "rise", { pace: "major", delay: 115 })
    ]),
    category: Object.freeze([
      step("route-line", "route", "line-x", { pace: "major", origin: "0 50%" }),
      step("waypoint", "waypoint", "latch", { delay: 65 }),
      step("checkpoint", "checkpoint", "rise", { pace: "major", delay: 105 })
    ]),
    search: Object.freeze([step("search-result", "routes", "from-start")]),
    jump: Object.freeze([
      step("route-line", "route", "line-x", { origin: "0 50%" }),
      step("waypoint-current", "location", "latch", { pace: "feedback", delay: 35 }),
      step("checkpoint", "checkpoint", "rise", { delay: 65 })
    ]),
    scrollspy: Object.freeze([
      step("route-marker", "travel", "from-start", { pace: "feedback" }),
      step("waypoint-current", "location", "latch", { pace: "feedback", delay: 20 })
    ]),
    disclosure: Object.freeze([
      step("route-branch", "branch", "line-x", { origin: "0 50%" }),
      step("disclosure", "expert-path", "rise", { delay: 40 })
    ]),
    refresh: Object.freeze([
      step("checkpoint", "connect", "latch", { pace: "feedback" }),
      step("verify", "verify", "rise", { delay: 50 }),
      step("ready", "ready", "latch", { delay: 100 })
    ]),
    save: Object.freeze([step("checkpoint", "saved", "latch", { pace: "feedback" })]),
    reorder: Object.freeze([step("waypoint", "route-updated", "from-start")]),
    drawer: Object.freeze([
      step("route-map", "map", "crossfade", { pace: "feedback" }),
      step("drawer", "navigator", "from-start", { pace: "major", delay: 20 })
    ]),
    transaction: Object.freeze([
      step("route-line", "operation-route", "line-x", { pace: "major", origin: "0 50%" }),
      step("transaction", "checkpoint-sequence", "rise", { delay: 55 }),
      step("waypoint-current", "verified-arrival", "latch", { pace: "feedback", delay: 105 })
    ]),
    preview: Object.freeze([
      step("route-branch", "preview-branch", "line-x", { pace: "feedback", origin: "0 50%" }),
      step("preview", "preview-checkpoint", "rise", { delay: 45 })
    ])
  }),
  ledger: Object.freeze({
    timing: Object.freeze({ major: 270, local: 170, feedback: 95 }),
    reducedRole: "rule",
    navigate: Object.freeze([
      step("folio", "folio", "rise", { pace: "major" }),
      step("rule", "rule", "line-x", { pace: "major", delay: 30, origin: "0 50%" }),
      step("ledger-row", "entries", "rise", { delay: 65 })
    ]),
    category: Object.freeze([
      step("folio", "folio", "crossfade", { pace: "major" }),
      step("rule", "rule", "line-x", { pace: "major", delay: 25, origin: "0 50%" }),
      step("ledger-row", "entries", "rise", { delay: 55 })
    ]),
    search: Object.freeze([step("search-result", "filtered", "rise")]),
    jump: Object.freeze([
      step("rule", "reference", "line-x", { pace: "feedback", origin: "0 50%" }),
      step("ledger-row", "entry", "focus", { delay: 25 })
    ]),
    scrollspy: Object.freeze([
      step("rule", "reference", "line-x", { pace: "feedback", origin: "0 50%" }),
      step("margin-note", "citation", "crossfade", { pace: "feedback", delay: 20 })
    ]),
    disclosure: Object.freeze([step("ledger-detail", "expanded-entry", "rise")]),
    refresh: Object.freeze([
      step("source", "source", "focus", { pace: "feedback" }),
      step("ledger-row", "reconciled", "rise", { delay: 40 }),
      step("effective", "effective", "crossfade", { pace: "feedback", delay: 80 })
    ]),
    save: Object.freeze([step("ledger-row", "amended", "focus", { pace: "feedback" })]),
    reorder: Object.freeze([step("ledger-row", "reordered", "focus", { pace: "feedback" })]),
    drawer: Object.freeze([
      step("drawer-backdrop", "backdrop", "crossfade", { pace: "feedback" }),
      step("outline", "outline", "from-start", { pace: "major", delay: 15 })
    ]),
    transaction: Object.freeze([
      step("rule", "transaction-rule", "line-x", { pace: "feedback", origin: "0 50%" }),
      step("transaction", "entry-amendment", "rise", { delay: 35 }),
      step("ledger-row", "receipt-posted", "focus", { pace: "feedback", delay: 75 })
    ]),
    preview: Object.freeze([
      step("rule", "preview-reference", "line-x", { pace: "feedback", origin: "0 50%" }),
      step("preview", "folio-proof", "crossfade", { delay: 35 })
    ])
  })
});

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, Number(value) || minimum));
}

function conceptName(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/_/g, "-");
  if (normalized === "index" || normalized === "indexhouse") return "index-house";
  if (MOTION_BLUEPRINTS[normalized]) return normalized;
  return "index-house";
}

function isElement(value) {
  return Boolean(value && value.nodeType === 1 && typeof value.querySelectorAll === "function");
}

function documentFor(root) {
  if (root?.nodeType === 9) return root;
  return root?.ownerDocument || (typeof document !== "undefined" ? document : null);
}

function scopeFor(root, documentObject) {
  if (root && typeof root.querySelectorAll === "function") return root;
  return documentObject;
}

function hostFor(root, documentObject) {
  if (isElement(root)) return root;
  return documentObject?.documentElement || null;
}

function escapeAttribute(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function queryAll(scope, selector) {
  if (!scope || typeof scope.querySelectorAll !== "function") return [];
  try {
    return [...scope.querySelectorAll(selector)];
  } catch {
    return [];
  }
}

function uniqueElements(values) {
  return [...new Set(values.filter(isElement))];
}

function resolveInput(input, context) {
  const value = typeof input === "function" ? input(context) : input;
  if (!value) return [];
  if (typeof value === "string") return queryAll(context.scope, value);
  if (isElement(value)) return [value];
  if (typeof value[Symbol.iterator] === "function") {
    return [...value].flatMap((item) => resolveInput(item, context));
  }
  return [];
}

function inferConcept(scope, host, explicit) {
  if (explicit) return conceptName(explicit);
  const own = host?.dataset?.concept;
  if (own) return conceptName(own);
  const conceptElement = scope?.querySelector?.("[data-concept]");
  const bodyConcept = documentFor(host)?.body?.dataset?.concept;
  return conceptName(conceptElement?.dataset?.concept || bodyConcept);
}

function normalizeIntent(value) {
  const intent = typeof value === "string" ? { kind: value } : { ...(value || {}) };
  intent.kind = String(intent.kind || "").toLowerCase();
  if (!KIND_SET.has(intent.kind)) {
    throw new TypeError(`Unsupported motion intent: ${intent.kind || "(missing)"}`);
  }
  return intent;
}

function rectFrom(value) {
  if (!value) return null;
  const left = Number(value.left ?? value.x);
  const top = Number(value.top ?? value.y);
  const width = Number(value.width);
  const height = Number(value.height);
  if (![left, top, width, height].every(Number.isFinite)) return null;
  return { left, top, width, height };
}

function oldRectFor(beforeRects, key) {
  if (!beforeRects || key == null) return null;
  if (typeof beforeRects.get === "function") return rectFrom(beforeRects.get(key));
  return rectFrom(beforeRects[key]);
}

function effectFrames(effect, concept, opacityOverride) {
  const opacity = Number.isFinite(opacityOverride) ? opacityOverride : 0;
  const distance = concept === "ledger" ? 7 : concept === "switchboard" ? 10 : 14;
  const startDirection = concept === "ledger" ? -1 : -distance;
  const endDirection = concept === "switchboard" ? 9 : distance;
  switch (effect) {
    case "from-start":
      return [{ opacity, transform: `translate3d(${startDirection}px, 0, 0)` }, { opacity: 1, transform: "translate3d(0, 0, 0)" }];
    case "from-end":
      return [{ opacity, transform: `translate3d(${endDirection}px, 0, 0)` }, { opacity: 1, transform: "translate3d(0, 0, 0)" }];
    case "rise":
      return [{ opacity, transform: `translate3d(0, ${distance}px, 0)` }, { opacity: 1, transform: "translate3d(0, 0, 0)" }];
    case "line-x":
      return [{ opacity: 0.35, transform: "scaleX(0.04)" }, { opacity: 1, transform: "scaleX(1)" }];
    case "line-y":
      return [{ opacity: 0.35, transform: "scaleY(0.08)" }, { opacity: 1, transform: "scaleY(1)" }];
    case "latch":
      return [{ opacity: 0.52, transform: "scale(0.94)" }, { opacity: 1, transform: "scale(1)" }];
    case "focus":
      return [{ opacity: 0.48, transform: "translate3d(0, 2px, 0)" }, { opacity: 1, transform: "translate3d(0, 0, 0)" }];
    case "crossfade":
    default:
      return [{ opacity: Number.isFinite(opacityOverride) ? opacityOverride : 0.35 }, { opacity: 1 }];
  }
}

function easingFor(effect) {
  if (effect === "latch") return EASE_IN_OUT;
  if (effect.startsWith("line")) return EASE_OUT_QUINT;
  if (effect === "focus" || effect === "crossfade") return EASE_OUT_QUART;
  return EASE_OUT_EXPO;
}

function selectedElements(stepDefinition, intent, context, stepIndex) {
  const key = intent.key == null ? null : String(intent.key);
  const role = escapeAttribute(stepDefinition.role);
  const stage = intent.stage == null ? null : escapeAttribute(intent.stage);
  const selectors = [];
  if (key != null) selectors.push(`[data-motion-role~="${role}"][data-motion-key="${escapeAttribute(key)}"]`);
  if (stage != null) selectors.push(`[data-motion-role~="${role}"][data-motion-stage~="${stage}"]`);
  selectors.push(`[data-motion-role~="${role}"]`);

  let elements = [];
  for (const selector of selectors) {
    elements = queryAll(context.scope, selector);
    if (elements.length) break;
  }

  const roleTargets = intent.targets && !Array.isArray(intent.targets) && typeof intent.targets === "object"
    ? intent.targets[stepDefinition.role]
    : null;
  if (roleTargets) elements.push(...resolveInput(roleTargets, context));
  if (stepIndex === 0) {
    elements.push(...resolveInput(intent.target, context));
    if (Array.isArray(intent.targets) || typeof intent.targets === "string" || isElement(intent.targets)) {
      elements.push(...resolveInput(intent.targets, context));
    }
  }
  return uniqueElements(elements);
}

function requestFrame(documentObject, signal) {
  if (signal.aborted) return Promise.resolve(false);
  const view = documentObject?.defaultView;
  const request = view?.requestAnimationFrame?.bind(view) || ((callback) => setTimeout(callback, 16));
  const cancel = view?.cancelAnimationFrame?.bind(view) || clearTimeout;
  return new Promise((resolve) => {
    let frameId;
    const onAbort = () => {
      cancel(frameId);
      resolve(false);
    };
    signal.addEventListener("abort", onAbort, { once: true });
    frameId = request(() => {
      signal.removeEventListener("abort", onAbort);
      resolve(!signal.aborted);
    });
  });
}

function prepareElement(transaction, element, stepDefinition) {
  if (!transaction.elementState.has(element)) {
    transaction.elementState.set(element, {
      willChange: element.style.willChange,
      transformOrigin: element.style.transformOrigin,
      stage: element.getAttribute("data-motion-stage"),
      state: element.getAttribute("data-motion-state")
    });
  }
  element.style.willChange = "transform, opacity";
  if (stepDefinition.origin) element.style.transformOrigin = stepDefinition.origin;
  element.setAttribute("data-motion-stage", stepDefinition.stage);
  element.setAttribute("data-motion-state", "running");
}

function restoreElements(transaction) {
  for (const [element, previous] of transaction.elementState) {
    element.style.willChange = previous.willChange;
    element.style.transformOrigin = previous.transformOrigin;
    if (previous.stage == null) element.removeAttribute("data-motion-stage");
    else element.setAttribute("data-motion-stage", previous.stage);
    if (previous.state == null) element.removeAttribute("data-motion-state");
    else element.setAttribute("data-motion-state", previous.state);
  }
  transaction.elementState.clear();
}

function animateElement(transaction, element, keyframes, options, stepDefinition) {
  if (transaction.signal.aborted || transaction.settling || typeof element.animate !== "function") {
    return Promise.resolve();
  }
  prepareElement(transaction, element, stepDefinition);
  const animation = element.animate(keyframes, {
    duration: options.duration,
    delay: options.delay,
    easing: options.easing,
    fill: "both",
    iterations: 1
  });
  transaction.animations.add(animation);
  return Promise.resolve(animation.finished)
    .catch(() => undefined)
    .finally(() => transaction.animations.delete(animation));
}

function animateStep(transaction, stepDefinition, intent, context, profile, stepIndex, excludedElements) {
  const elements = selectedElements(stepDefinition, intent, context, stepIndex)
    .filter((element) => !excludedElements.has(element));
  if (!elements.length) return [];
  transaction.participantRoles.set(stepDefinition.role, (transaction.participantRoles.get(stepDefinition.role) || 0) + elements.length);
  const configuredDuration = intent.duration ?? profile.timing[stepDefinition.pace];
  const duration = clamp(configuredDuration, 70, 500);
  const visibleStaggerCount = Math.min(MAX_STAGGERED_ITEMS, Math.max(1, elements.length));
  const requestedStagger = Number.isFinite(intent.stagger) ? intent.stagger : 24;
  const stagger = visibleStaggerCount > 1
    ? Math.min(requestedStagger, MAX_STAGGER_MS / (visibleStaggerCount - 1))
    : 0;
  return elements.map((element, index) => animateElement(transaction, element,
    effectFrames(stepDefinition.effect, transaction.concept, stepDefinition.opacity), {
      duration,
      delay: stepDefinition.delay + Math.min(index, MAX_STAGGERED_ITEMS - 1) * stagger,
      easing: easingFor(stepDefinition.effect)
    }, stepDefinition));
}

function animateFlip(transaction, intent, context, profile) {
  if (!intent.beforeRects) return { promises: [], elements: new Set() };
  const selector = intent.flipSelector || "[data-motion-key]";
  const elements = queryAll(context.scope, selector);
  const flipped = new Set();
  const promises = [];
  for (const element of elements) {
    const key = element.getAttribute("data-motion-key");
    const before = oldRectFor(intent.beforeRects, key);
    const after = rectFrom(element.getBoundingClientRect?.());
    if (!before || !after) continue;
    const deltaX = before.left - after.left;
    const deltaY = before.top - after.top;
    const scaleX = after.width > 0 ? before.width / after.width : 1;
    const scaleY = after.height > 0 ? before.height / after.height : 1;
    if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5 && Math.abs(scaleX - 1) < 0.01 && Math.abs(scaleY - 1) < 0.01) continue;
    const flipStep = step("reorder-item", "reflow", "focus", { origin: "0 0" });
    flipped.add(element);
    promises.push(animateElement(transaction, element, [
      { opacity: 0.82, transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY})` },
      { opacity: 1, transform: "translate3d(0, 0, 0) scale(1, 1)" }
    ], {
      duration: clamp(intent.duration ?? profile.timing.local, 120, 420),
      delay: 0,
      easing: EASE_OUT_QUINT
    }, flipStep));
  }
  if (flipped.size) {
    transaction.participantRoles.set("reorder-item", (transaction.participantRoles.get("reorder-item") || 0) + flipped.size);
    const semanticRole = profile.reorder?.[0]?.role;
    if (semanticRole && semanticRole !== "reorder-item") transaction.participantRoles.set(semanticRole, (transaction.participantRoles.get(semanticRole) || 0) + flipped.size);
  }
  return { promises, elements: flipped };
}

function reducedCue(transaction, intent, context, profile) {
  const preferred = queryAll(context.scope, `[data-motion-role~="${escapeAttribute(profile.reducedRole)}"]`);
  const explicit = resolveInput(intent.target, context);
  const fallback = queryAll(context.scope, `[data-motion-role~="${escapeAttribute(profile[intent.kind]?.[0]?.role || "scene")}"]`);
  const elements = uniqueElements([...preferred, ...explicit, ...fallback]).slice(0, 1);
  const cueStep = step(profile.reducedRole, "reduced-cue", "crossfade", { pace: "feedback" });
  const duration = clamp(intent.reducedDuration ?? 100, 80, 120);
  if (elements.length) transaction.participantRoles.set(profile.reducedRole, elements.length);
  return elements.map((element) => animateElement(transaction, element,
    [{ opacity: 0.72 }, { opacity: 1 }], {
      duration,
      delay: 0,
      easing: EASE_OUT_QUART
    }, cueStep));
}

function activeRegionHost(scope, host, region, explicit) {
  if (isElement(explicit)) return explicit;
  const match = queryAll(scope, `[data-motion-region="${escapeAttribute(region)}"]`)[0];
  return match || host;
}

function setRegionMarker(transaction) {
  const marker = transaction.regionHost;
  if (!marker?.dataset) return;
  marker.dataset.motionTransaction = String(transaction.id);
  marker.dataset.motionIntent = transaction.kind;
  marker.dataset.motionState = "running";
}

function clearRegionMarker(transaction, status) {
  const marker = transaction.regionHost;
  if (!marker?.dataset || marker.dataset.motionTransaction !== String(transaction.id)) return;
  delete marker.dataset.motionTransaction;
  delete marker.dataset.motionIntent;
  delete marker.dataset.motionState;
  marker.dataset.motionSettled = status;
}

/** Capture browser-only presentation geometry for a later reorder intent. */
export function captureMotionRects(root, selector = "[data-motion-key]") {
  const documentObject = documentFor(root);
  const scope = scopeFor(root, documentObject);
  const result = new Map();
  for (const element of queryAll(scope, selector)) {
    const key = element.getAttribute("data-motion-key");
    const rect = rectFrom(element.getBoundingClientRect?.());
    if (key != null && rect) result.set(key, rect);
  }
  return result;
}

/**
 * Progressive enhancement helper. Callers must opt in; WAAPI remains the full
 * fallback and reduced motion always bypasses the browser transition.
 */
export function startOptionalViewTransition(documentObject, update, enabled = true) {
  if (!enabled || typeof update !== "function" || typeof documentObject?.startViewTransition !== "function") {
    return { transition: null, updated: Promise.resolve().then(update) };
  }
  try {
    const transition = documentObject.startViewTransition(update);
    return {
      transition,
      updated: Promise.resolve(transition.updateCallbackDone)
    };
  } catch {
    // An already-active or unsupported transition must not block the state commit.
    return { transition: null, updated: Promise.resolve().then(update) };
  }
}

export function createMotionCoordinator({ root, getReducedMotion = () => false } = {}) {
  const documentObject = documentFor(root);
  const scope = scopeFor(root, documentObject);
  const host = hostFor(root, documentObject);
  if (!scope || !host) throw new TypeError("createMotionCoordinator requires a DOM root");

  let destroyed = false;
  let transactionCounter = 0;
  let activeViewTransition = null;
  const activeRegions = new Map();
  const mediaQuery = documentObject?.defaultView?.matchMedia?.("(prefers-reduced-motion: reduce)") || null;

  function readsReducedMotion(intent = {}) {
    let supplied = false;
    try {
      supplied = Boolean(getReducedMotion());
    } catch {
      supplied = false;
    }
    const attribute = documentObject?.documentElement?.getAttribute("data-reduced-motion") === "1";
    return Boolean(intent.reducedMotion || supplied || attribute || mediaQuery?.matches);
  }

  function finalize(transaction, status, error = null) {
    if (transaction.finalized) return;
    transaction.finalized = true;
    for (const animation of transaction.animations) {
      try { animation.cancel(); } catch { /* already idle */ }
    }
    transaction.animations.clear();
    restoreElements(transaction);
    clearRegionMarker(transaction, status);
    if (activeRegions.get(transaction.region)?.id === transaction.id) activeRegions.delete(transaction.region);
    const result = Object.freeze({
      id: transaction.id,
      region: transaction.region,
      kind: transaction.kind,
      concept: transaction.concept,
      status,
      reducedMotion: transaction.reducedMotion,
      participants: [...transaction.participantRoles.values()].reduce((total, count) => total + count, 0),
      roles: Object.freeze(Object.fromEntries(transaction.participantRoles))
    });
    if (error) transaction.reject(error);
    else transaction.resolve(result);
  }

  function cancelTransaction(transaction, status = "cancelled") {
    if (!transaction || transaction.finalized) return;
    transaction.controller.abort(status);
    for (const animation of transaction.animations) {
      try { animation.cancel(); } catch { /* already idle */ }
    }
    finalize(transaction, status);
  }

  async function execute(transaction, intent, context, profile) {
    try {
      const commit = intent.commit || intent.update;
      if (typeof commit === "function") {
        const useViewTransition = Boolean(intent.viewTransition)
          && !transaction.reducedMotion
          && !activeViewTransition
          && (intent.kind === "navigate" || intent.kind === "category");
        const { transition, updated } = startOptionalViewTransition(documentObject, commit, useViewTransition);
        transaction.viewTransition = transition;
        if (transition) {
          const token = {
            transition,
            finished: Promise.resolve(transition.finished).catch(() => undefined)
          };
          activeViewTransition = token;
          void token.finished.then(() => {
            if (activeViewTransition === token) activeViewTransition = null;
          });
        }
        await updated;
      }
      if (transaction.finalized || transaction.signal.aborted) return;

      await requestFrame(documentObject, transaction.signal);
      await requestFrame(documentObject, transaction.signal);
      if (transaction.finalized || transaction.signal.aborted) return;
      const externalWork = intent.waitFor || intent.scroll;
      if (typeof externalWork === "function") await externalWork(context);
      else if (externalWork && typeof externalWork.then === "function") await externalWork;
      if (transaction.finalized || transaction.signal.aborted) return;
      if (transaction.settling) {
        finalize(transaction, "settled");
        return;
      }

      const flip = transaction.reducedMotion
        ? { promises: [], elements: new Set() }
        : animateFlip(transaction, intent, context, profile);
      const promises = [...flip.promises];
      if (transaction.viewTransition?.finished) {
        promises.push(Promise.resolve(transaction.viewTransition.finished).catch(() => undefined));
      }
      if (transaction.reducedMotion) {
        promises.push(...reducedCue(transaction, intent, context, profile));
      } else {
        const blueprint = profile[intent.kind] || [];
        blueprint.forEach((definition, index) => {
          promises.push(...animateStep(transaction, definition, intent, context, profile, index, flip.elements));
        });
      }
      if (transaction.settling) {
        for (const animation of transaction.animations) {
          try { animation.finish(); } catch { /* animation may already be idle */ }
        }
      }
      await Promise.allSettled(promises);
      if (!transaction.finalized) finalize(transaction, transaction.settling ? "settled" : "completed");
    } catch (error) {
      if (transaction.signal.aborted || transaction.finalized) return;
      finalize(transaction, "error", error);
    }
  }

  function run(value) {
    if (destroyed) return Promise.reject(new Error("Motion coordinator has been destroyed"));
    const intent = normalizeIntent(value);
    const concept = inferConcept(scope, host, intent.concept);
    const profile = MOTION_BLUEPRINTS[concept];
    const region = isElement(intent.region)
      ? intent.region.dataset.motionRegion || intent.kind
      : String(intent.region || intent.kind);
    const previous = activeRegions.get(region);
    if (previous) cancelTransaction(previous, "superseded");

    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    });
    const controller = new AbortController();
    const context = { scope, root: host, document: documentObject, intent };
    const transaction = {
      id: ++transactionCounter,
      region,
      regionHost: activeRegionHost(scope, host, region, isElement(intent.region) ? intent.region : intent.regionElement),
      kind: intent.kind,
      concept,
      reducedMotion: readsReducedMotion(intent),
      controller,
      signal: controller.signal,
      animations: new Set(),
      elementState: new Map(),
      participantRoles: new Map(),
      viewTransition: null,
      settling: false,
      finalized: false,
      promise,
      resolve,
      reject
    };
    activeRegions.set(region, transaction);
    setRegionMarker(transaction);
    void execute(transaction, intent, context, profile);
    return promise;
  }

  function cancel(region) {
    if (region == null) {
      const transactions = [...activeRegions.values()];
      transactions.forEach((transaction) => cancelTransaction(transaction));
      return transactions.length;
    }
    const regionName = isElement(region) ? region.dataset.motionRegion : String(region);
    const transaction = isElement(region)
      ? [...activeRegions.values()].find((candidate) => candidate.regionHost === region || candidate.region === regionName)
      : activeRegions.get(regionName);
    if (!transaction) return 0;
    cancelTransaction(transaction);
    return 1;
  }

  async function whenIdle() {
    while (activeRegions.size || activeViewTransition) {
      const pending = [...activeRegions.values()].map((transaction) => transaction.promise.catch(() => undefined));
      if (activeViewTransition) pending.push(activeViewTransition.finished);
      if (!pending.length) break;
      await Promise.all(pending);
    }
  }

  async function settle() {
    for (const transaction of activeRegions.values()) {
      transaction.settling = true;
      for (const animation of transaction.animations) {
        try { animation.finish(); } catch { /* animation may not be ready */ }
      }
    }
    await whenIdle();
  }

  function onMotionPreferenceChange(event) {
    if (event.matches) void settle();
  }
  mediaQuery?.addEventListener?.("change", onMotionPreferenceChange);

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    mediaQuery?.removeEventListener?.("change", onMotionPreferenceChange);
    cancel();
  }

  return Object.freeze({ run, cancel, whenIdle, settle, destroy });
}
