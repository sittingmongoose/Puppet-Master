/* O55 · a chapter arrives with its first screen; the rest of its page is filled before anyone reaches it (FO-196, the
   cost part; lane U, 2026-11-16). A chapter switch built the whole of the new page in one task and styled and laid it
   all out in the next frame, while the old chapter stayed on screen; only 8 to 19 % of what was built was on screen
   (Code & Tools: 195 of 2,472 elements). Now an arrival (another chapter, Home -> a chapter, a page that has to be
   drawn new) builds the page's sections down to two screens' height of their estimated size, always through the
   section it lands on and one more; every later section is drawn as itself, with its heading, owner line and id, and
   an empty row list of its estimated height (data-o55-fill="pending"). Its rows are filled:
   - when the list comes within a screen of the view (an IntersectionObserver on the page's scroller);
   - in idle slices once the arrival's entrance is over, one section a slice, in page order;
   - at once, before anything reads a far section: a jump to a section, a setting revealed (search, Details links,
     deep links), a page tab further down, the More options opening, End / Home / Ctrl+End, Tab / Shift+Tab, a press on
     the scroll bar, Find in page (Ctrl/Cmd+F), document Select All (Ctrl/Cmd+A), printing.
   A redraw in place (a changed setting) draws a filled section in full and a pending one as a shell again, so it never
   drops rows or builds them early. A fill only puts rows into a section's existing list: it replaces no layout, adds no
   page-enter and animates nothing, so the chapter's one entrance (pageIn) never plays twice. Manager pages are one
   section each and are drawn as before; so is the first page after load and every page mounted later.
   A scroll that lands on sections content-visibility still skips shows them before its frame is drawn (FO-245), so a
   fast wheel never shows the page's ground where rows are; the arrival's first frame still skips every far section.
   A wheel scroll that lands on a page of the chapter still unmounted mounts it before its frame (FO-245 r3, gated on a
   recent wheel in r6); every other scroll (End / Home, PageDown, arrows, the scroll bar, jump links, a script) mounts
   exactly as before, through the observer, so End lands at the end it measured. End / Home keep the browser's own smooth
   scroll; the blank frames it still shows while pages are unmounted are tracked in FO-248. */

const O55FS_ATTR = 'data-o55-fill';
const o55fs = {
  seq: 0,            // renderApp calls
  seen: -1,          // the render whose first section decided the budget
  ws: null,          // the page whose later sections may be shells
  budget: 0, used: 0, target: null, afterTarget: false,
  pending: new Map(),  // section id -> { section, workspace, index }
  scroller: null, observer: null, idleTimer: 0, idleJob: null, ticket: 0
};
const o55fsSkipped = new Set();   /* sections content-visibility skips now (FO-245, below) */
const o55fsRows = s => (s && Array.isArray(s.settings) ? s.settings.length : 0);
const o55fsRowH = () => (hostIsNarrow() ? 112 : 70);
const o55fsEst = s => 64 + o55fsRows(s) * o55fsRowH();
function o55fsReset() {
  o55fs.ticket++;
  o55fs.pending.clear();
  if (o55fs.observer) { o55fs.observer.disconnect(); o55fs.observer = null; }
  clearTimeout(o55fs.idleTimer); o55fs.idleTimer = 0;
  if (o55fs.idleJob && o55fs.idleJob.cancel) o55fs.idleJob.cancel();
  o55fs.idleJob = null;
  o55fs.scroller = null;
}
/* the section an arrival lands on: a jump's section, or the section of the setting it opens */
function o55fsTarget() {
  if (pendingScroll && pendingScroll.section) return pendingScroll.section;
  const id = state.detailSetting, placed = id && PM51.placement && PM51.placement.sectionOf ? PM51.placement.sectionOf(id) : null;
  if (placed && placed.id) return placed.id;
  const f = id ? findSettingGlobal(id) : null;
  return f && f.section ? f.section.id : null;
}

/* ---------- drawing: in full, or as a shell ------------------------------------------------------------------------- */
const o55fsKit = renderSettingsSection;
renderSettingsSection = function (section, workspace, index) {
  const plain = section && Array.isArray(section.settings) && workspace && workspace.type === 'settings' && !workspace.virtualAllSettings;
  if (!plain) return o55fsKit.apply(this, arguments);
  if (o55fs.seen !== o55fs.seq) {
    o55fs.seen = o55fs.seq;
    if (o55cMode === 'arrival' && !state.home) {
      o55fsReset();
      const sc = root.querySelector('#settings-document');
      o55fs.ws = state.workspace;
      o55fs.budget = 2 * ((sc && sc.clientHeight) || window.innerHeight || 900);
      o55fs.used = 0; o55fs.target = o55fsTarget(); o55fs.afterTarget = false;
    } else if (o55cMode !== 'in-place' && o55cMode !== 'body') {
      o55fsReset(); o55fs.ws = null;   /* the first page after load: drawn in full, as before */
    }
  }
  if (o55cMode === 'arrival' && workspace.id === o55fs.ws) {
    const isTarget = section.id === o55fs.target, take = o55fs.used < o55fs.budget || isTarget || o55fs.afterTarget;
    if (o55fs.afterTarget) o55fs.afterTarget = false;
    if (isTarget) o55fs.afterTarget = true;
    o55fs.used += o55fsEst(section);
    if (take) return o55fsKit.apply(this, arguments);
    o55fs.pending.set(section.id, { section, workspace, index });
    return o55fsShell(section, workspace, index);
  }
  if (o55fs.pending.has(section.id) && workspace.id === o55fs.ws) return o55fsShell(section, workspace, index);
  return o55fsKit.apply(this, arguments);
};
/* the section as drawn, without its rows: its own heading, owner line and id; the row list holds its estimated height */
function o55fsShell(section, workspace, index) {
  const html = o55fsKit.call(this, Object.assign({}, section, { settings: [] }), workspace, index);
  const idle = section.settings.length > 0 && section.settings.every(st => (O55R[st.id] || {}).when && !PM51.relevant(st.id));
  return html
    .replace(/^(\s*<section class="settings-section o55-group)/, idle ? '$1 o55-sec-off' : '$1')
    .replace(/style="contain-intrinsic-size:auto \d+px"/, `style="contain-intrinsic-size:auto ${o55fsEst(section)}px"`)
    .replace('<div class="setting-list">', `<div class="setting-list" ${O55FS_ATTR}="pending" style="min-height:${o55fsRows(section) * o55fsRowH()}px">`);
}

/* ---------- filling ------------------------------------------------------------------------------------------------- */
function o55fsFill(id) {
  const p = o55fs.pending.get(id);
  if (!p) return false;
  o55fs.pending.delete(id);
  const sec = root.querySelector(`#section-${cssEscape(id)}`), list = sec && sec.querySelector(`:scope > .setting-list[${O55FS_ATTR}]`);
  if (!list) return false;
  const html = o55fsKit.call(null, p.section, p.workspace, p.index);
  o55cKeep(html);
  const tpl = document.createElement('template'); tpl.innerHTML = html;
  const fresh = tpl.content.firstElementChild, rows = fresh && fresh.querySelector(':scope > .setting-list');
  if (o55fs.observer) o55fs.observer.unobserve(list);
  list.replaceChildren(...(rows ? rows.childNodes : []));
  list.removeAttribute(O55FS_ATTR); list.style.removeProperty('min-height'); if (!list.getAttribute('style')) list.removeAttribute('style');
  if (fresh) sec.classList.toggle('o55-sec-off', fresh.classList.contains('o55-sec-off'));
  try { o55ArmDisclosures(sec); } catch (e) { /* cosmetic */ }
  if (!o55fs.pending.size) o55fsDone();
  return true;
}
/* every pending section of the page, in page order, up to and with `id` (all of them when id is not on the page) */
function o55fsFillThrough(id) {
  if (!o55fs.pending.size) return;
  const ids = [...root.querySelectorAll(`#settings-document [data-section-id]`)].map(n => n.dataset.sectionId);
  const stop = ids.indexOf(id);
  for (const sid of ids) {
    if (o55fs.pending.has(sid)) o55fsFill(sid);
    if (stop >= 0 && sid === id) break;
  }
}
function o55fsFillAll() { if (o55fs.pending.size) o55fsFillThrough(null); }
/* Scroll events run before the frame's rAF/layout/paint. A fling can outrun IntersectionObserver delivery, so fill
   sections entering the view plus one viewport now (R93 #4). Read section boxes, retaining far content skipping. */
function o55fsFillNear(sc) {
  if (!o55fs.pending.size) return;
  const view = sc.getBoundingClientRect(), margin = sc.clientHeight;
  for (const sec of sc.querySelectorAll('[data-section-id]')) {
    if (!o55fs.pending.has(sec.dataset.sectionId) || sec.closest('details:not([open])')) continue;
    const box = sec.getBoundingClientRect();
    if (box.height && box.bottom >= view.top - margin && box.top <= view.bottom + margin) o55fsFill(sec.dataset.sectionId);
  }
}
function o55fsDone() {
  if (o55fs.observer) { o55fs.observer.disconnect(); o55fs.observer = null; }
  clearTimeout(o55fs.idleTimer); o55fs.idleTimer = 0;
  if (o55fs.idleJob && o55fs.idleJob.cancel) o55fs.idleJob.cancel();
  o55fs.idleJob = null;
  /* the end space under the page's last section was sized from its estimate */
  const sc = root.querySelector('#settings-document'), end = sc && sc.querySelector('.settings-end-space');
  if (sc && end) { try { sizeSettingsEndSpace(sc, end, [...sc.querySelectorAll('[data-section-id]')]); } catch (e) { /* cosmetic */ } }
}
/* after the commit: proximity, then idle slices once the entrance is over */
function o55fsArm() {
  const sc = root.querySelector('#settings-document'), ticket = o55fs.ticket;
  if (!sc || !o55fs.pending.size) return;
  o55fs.scroller = sc;
  if (typeof IntersectionObserver === 'function') {
    o55fs.observer = new IntersectionObserver(entries => {
      /* A queued notification can outlive disconnect(). It belongs only to this live chapter and scroller (R97 P2). */
      if (ticket !== o55fs.ticket || !sc.isConnected || sc !== root.querySelector('#settings-document')) return;
      for (const e of entries) if (e.isIntersecting && e.target.isConnected && sc.contains(e.target)) {
        const s = e.target.closest('[data-section-id]');
        if (s && o55fs.pending.has(s.dataset.sectionId)) o55fsFillThrough(s.dataset.sectionId);
      }
    }, { root: sc, rootMargin: '100% 0px' });
    sc.querySelectorAll(`.setting-list[${O55FS_ATTR}]`).forEach(l => o55fs.observer.observe(l));
  }
  const slice = dl => {
    if (ticket !== o55fs.ticket || !o55fs.pending.size) return;
    o55fs.idleJob = null;
    if (!sc.isConnected || sc !== root.querySelector('#settings-document')) { o55fsReset(); return; }
    const next = [...root.querySelectorAll(`#settings-document .setting-list[${O55FS_ATTR}]`)][0];
    const sec = next && next.closest('[data-section-id]');
    if (!sec) { o55fsReset(); return; }
    o55fsFill(sec.dataset.sectionId);
    if (o55fs.pending.size) ask();
  };
  const ask = () => { o55fs.idleJob = window.PM_BUSY && PM_BUSY.idle ? PM_BUSY.idle(slice, 1000) : { cancel: (id => () => cancelIdleCallback(id))(requestIdleCallback(slice, { timeout: 1000 })) }; };
  /* the entrance (pageIn, 220 ms) runs first */
  o55fs.idleTimer = window.setTimeout(() => { o55fs.idleTimer = 0; if (ticket === o55fs.ticket) ask(); }, 450);
}
const o55fsRender = renderApp;
renderApp = function () {
  o55fs.seq++;
  const r = o55fsRender.apply(this, arguments);
  /* Home and manager-only pages render no plain section, so their replacement must end the old job here. */
  if (o55fs.scroller && o55fs.scroller !== root.querySelector('#settings-document')) o55fsReset();
  if (o55fs.pending.size && !o55fs.observer && !o55fs.idleTimer && !o55fs.idleJob) o55fsArm();
  for (const s of o55fsSkipped) if (!s.isConnected) o55fsSkipped.delete(s);   /* a redraw's removed sections (FO-245) */
  return r;
};

/* ---------- whatever reads a far section fills first (these wrappers are the outermost: this file loads last) ------- */
const o55fsToSection = scrollToSection;
scrollToSection = function (sectionId) { o55fsFillThrough(sectionId); return o55fsToSection.apply(this, arguments); };
const o55fsJump = jumpToWorkspace;
jumpToWorkspace = function (wsId) {
  /* a page further down the chapter: the pending sections above it are filled first, so it lands exactly */
  if (o55fs.pending.size && o55fs.ws && wsId !== o55fs.ws) {
    const ids = getDomain().workspaces.map(w => w.id);
    if (ids.indexOf(wsId) > ids.indexOf(o55fs.ws)) o55fsFillAll();
  }
  return o55fsJump.apply(this, arguments);
};
const o55fsReveal = PM51.revealSetting;
PM51.revealSetting = function (id, opts) {
  if (o55fs.pending.size) {
    const placed = PM51.placement && PM51.placement.byId ? PM51.placement.byId[id] : null;
    const f = placed ? null : findSettingGlobal(id);
    const ws = placed ? placed.workspace : f && f.workspace ? f.workspace.id : null;
    /* Another page or an existing/requested About inspector makes navigate remount (R93 #3, R103 P1).
       Its destination owns the fill; never build shells that it is about to discard. */
    if (ws === o55fs.ws && !state.detailSetting && !(opts && opts.detail)) {
      const sid = placed ? placed.section : f && f.section ? f.section.id : null;
      if (sid) o55fsFillThrough(sid); else o55fsFillAll();
    }
  }
  return o55fsReveal.apply(this, arguments);
};
/* The summary's motion handler opens and measures in its click task; toggle arrives after that measurement (R92 P1).
   Fill before its own listener or the native Reduced Motion default opens it. Programmatic opens share the fill. */
PM51.fillDisclosure = d => {
  if (o55fs.pending.size && d) d.querySelectorAll('[data-section-id]').forEach(s => o55fsFill(s.dataset.sectionId));
};
root.addEventListener('click', e => {
  if (!o55fs.pending.size) return;
  const sum = e.target.closest && e.target.closest('details.pm51-advanced > summary');
  const d = sum && sum.parentElement;
  if (d && !d.open) PM51.fillDisclosure(d);
}, true);
root.addEventListener('toggle', e => {
  const d = e.target;
  if (d && d.open && d.matches && d.matches('details')) PM51.fillDisclosure(d);
}, true);
const O55FS_KEYS = new Set(['End', 'Home']);
root.addEventListener('keydown', e => {
  if (!o55fs.pending.size) return;
  const sc = root.querySelector('#settings-document');
  if (O55FS_KEYS.has(e.key) && sc && (e.target === sc || sc.contains(e.target)) && !(e.target.matches && e.target.matches('input, textarea, select, [contenteditable=""], [contenteditable="true"]'))) o55fsFillAll();
}, true);
root.addEventListener('pointerdown', e => {
  const sc = root.querySelector('#settings-document');
  if (o55fs.pending.size && sc && e.target === sc) o55fsFillAll();   /* its scroll bar */
}, true);
/* FO-245: a section that content-visibility skipped is not painted in the frame a scroll brings it into view. Chrome
   decides that it is relevant only after that frame's layout, so a wheel that jumps past a screen showed the page's
   ground, without even the sections' own cards, for one to seven frames of a 60 fps film, rows filled or not (a fill on
   the wheel event changed nothing; content-visibility off removed every blank frame). The scroll event runs before that
   frame's style and layout: a skipped section that the new position puts in the view is shown now (content-visibility:
   visible, inline), so the frame that scrolls to it paints it, and two frames later it is handed back to
   content-visibility, which by then has found it relevant (no blank frame at the hand-back either). Only skipped
   sections in the view are touched, so an ordinary scroll, which content-visibility's own margin keeps ahead of, changes
   nothing, a shown section is never skipped again at the hand-back (no one-frame unlock), and an arrival's first frame
   still skips every far section (FO-196). */
root.addEventListener('contentvisibilityautostatechange', e => {
  const s = e.target;
  if (!s.matches || !s.matches('.settings-section')) return;
  if (e.skipped) o55fsSkipped.add(s); else o55fsSkipped.delete(s);
}, true);
/* shown now, handed back to content-visibility two frames later, by when it has found them relevant */
function o55fsShowFor(shown) {
  if (shown.length) requestAnimationFrame(() => requestAnimationFrame(() => shown.forEach(s => {
    s.style.removeProperty('content-visibility');
    if (!s.getAttribute('style')) s.removeAttribute('style');
  })));
}
const o55fsInView = (box, view) => box.height > 0 && box.bottom > view.top && box.top < view.bottom;
function o55fsShowNear(sc) {
  if (!o55fsSkipped.size && !o55fsFresh.size) return;
  const view = sc.getBoundingClientRect(), shown = [];
  for (const s of o55fsSkipped) {
    if (!s.isConnected) { o55fsSkipped.delete(s); continue; }
    if (!sc.contains(s) || s.closest('details:not([open])')) continue;
    if (o55fsInView(s.getBoundingClientRect(), view)) { s.style.contentVisibility = 'visible'; o55fsSkipped.delete(s); shown.push(s); }
  }
  /* a page mounted in the last two frames: its sections have not been judged by content-visibility yet (r3, below) */
  for (const body of o55fsFresh) {
    if (!body.isConnected) { o55fsFresh.delete(body); continue; }
    if (!sc.contains(body)) continue;
    body.querySelectorAll(':scope > .settings-section').forEach(s => {
      if (s.style.contentVisibility !== 'visible' && !s.closest('details:not([open])') && o55fsInView(s.getBoundingClientRect(), view)) { s.style.contentVisibility = 'visible'; shown.push(s); }
    });
  }
  o55fsShowFor(shown);
}
/* FO-245 r3: a page of the chapter that is still a lazy placeholder (data-workspace-mounted="false") is mounted by an
   IntersectionObserver whose mount waits for a later animation frame, so a long wheel, End or a fling that lands on it
   showed the empty placeholder for three to twenty-two frames (Code & Tools -> Containers, Astra A245). The scroll event
   runs before the frame: each placeholder the new position puts in the view is mounted now, in page order, and the
   sections of a page mounted in the last two frames that are in the view are shown like the skipped ones above, so the
   frame that scrolls there paints its rows. That frame costs the mount (one longer frame on the source view, never a
   blank one); placeholders outside the view stay as they are, and the observer's 360 px margin keeps mounting them
   ahead of an ordinary scroll, as before.
   FO-245 r6 (R145): only a wheel scroll mounts here. Chrome animates a keyboard End over 5 to 17 scroll events toward the
   end it measured at the key (scroll-behavior does not govern it), and a mount on the way grew the document 1,100 to
   1,700 px under that animation, which then stopped 630 to 1,270 px short of the new end (26 of 112 presses; main 0 of
   107). So a passive wheel listener (it never cancels or delays the wheel; no key listener is involved) notes the time of
   the last wheel event, and the scroll event mounts only while that wheel's smooth scroll can still be running
   (O55FS_WHEEL_MS; Chrome 158: a real wheel tick scrolls for 165-190 ms and its last scroll event comes at most 275 ms
   after the last tick; a single long wheel needs its mount 11-31 ms after the wheel). Every other scroll mounts as on
   main: the observer, after the frame. */
const o55fsFresh = new Set();
const o55fsMount = mountContinuousWorkspace;
mountContinuousWorkspace = function (id) {
  const was = root.querySelector(`[data-continuous-workspace-body="${cssEscape(id)}"]`);
  const cold = !!(was && was.dataset.workspaceMounted === 'false');
  const body = o55fsMount.apply(this, arguments);
  if (cold && body && body.dataset.workspaceMounted === 'true') {
    o55fsFresh.add(body);
    requestAnimationFrame(() => requestAnimationFrame(() => o55fsFresh.delete(body)));
  }
  return body;
};
function o55fsMountNear(sc) {
  if (!sc.querySelector('[data-continuous-workspace-body][data-workspace-mounted="false"]')) return 0;
  const view = sc.getBoundingClientRect();
  let n = 0;
  for (let guard = 0; guard < 64; guard++) {
    const cold = [...sc.querySelectorAll('[data-continuous-workspace-body][data-workspace-mounted="false"]')]
      .find(b => !b.closest('details:not([open])') && o55fsInView(b.getBoundingClientRect(), view));
    if (!cold) break;
    const body = mountContinuousWorkspace(cold.dataset.continuousWorkspaceBody);
    if (!body || body.dataset.workspaceMounted === 'false') break;
    n++;
  }
  return n;
}
const O55FS_WHEEL_MS = 400;
let o55fsWheelAt = -Infinity;
root.addEventListener('wheel', () => { o55fsWheelAt = performance.now(); }, { capture: true, passive: true });
const o55fsWheeling = () => performance.now() - o55fsWheelAt <= O55FS_WHEEL_MS;
root.addEventListener('scroll', e => { if (e.target.id === 'settings-document') { if (o55fsWheeling()) o55fsMountNear(e.target); o55fsFillNear(e.target); o55fsShowNear(e.target); } }, true);
/* These global keys belong to Settings only while its panel can receive input. Onboarding leaves the active class
   in place beneath its inert app; modal dialogs can cover Settings without changing either (R97 P1). */
function o55fsInteractive() {
  const panel = document.getElementById('panel-settings');
  if (!panel || !panel.classList.contains('active') || panel.closest('[inert], [hidden], [aria-hidden="true"]')) return false;
  if (document.documentElement.hasAttribute('data-o55-open') || document.getElementById('o55-open-scrim')) return false;
  if (!panel.getClientRects().length || getComputedStyle(panel).visibility !== 'visible') return false;
  return ![...document.querySelectorAll('[aria-modal="true"], dialog[open]')].some(d =>
    !d.closest('[hidden], [inert], [aria-hidden="true"]') && d.getClientRects().length && getComputedStyle(d).visibility === 'visible');
}
document.addEventListener('keydown', e => {
  const find = (e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F');
  const next = e.key === 'F3' && !e.ctrlKey && !e.metaKey && !e.altKey;
  /* The native document selection must see every row before Copy (R106 P1). Editing controls keep their own
     Select All, including inherited/plaintext-only contenteditable and an editor's focusable descendants. */
  const editing = e.target && (e.target.isContentEditable || e.target.closest && e.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], .cm-editor, .monaco-editor, .ace_editor, .CodeMirror'));
  const selectAll = (e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'a' || e.key === 'A') && !editing;
  if (o55fs.pending.size && (find || next || selectAll) && o55fsInteractive()) o55fsFillAll();
}, true);
/* Tab and Shift+Tab (F's L1, 2026-11-17): the browser picks the next control among those that exist, so focus put back
   without scrolling next to an unfilled section (a redraw's or a dialog's focus restore) would pass over it. Every
   pending section is filled before the key's default action, from any control, inputs too (Tab leaves an input), and
   from no control at all (the starting point of a click on text can sit anywhere). On window, so it runs first.
   Only the active Settings view participates: a Tab in Usage must not build its hidden chapter (R93 #8). */
window.addEventListener('keydown', e => { if (e.key === 'Tab' && o55fs.pending.size && !e.ctrlKey && !e.metaKey && !e.altKey && o55fsInteractive()) o55fsFillAll(); }, true);
window.addEventListener('beforeprint', o55fsFillAll);
