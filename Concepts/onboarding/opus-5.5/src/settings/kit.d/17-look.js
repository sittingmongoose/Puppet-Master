/* O55 · the look settings change the app. Only Theme, Light or dark, the Glass rows, Reduce motion and Where the chat
   sits were painted by the base; Accent color, Size of everything, Text size, Spacing, Line spacing, Animation speed,
   High contrast, Keyboard focus outline, App font, Border width, Corner roundness, Extra padding, Scrollbar width,
   the Retro texture strengths and Show names next to those icons were stored and did nothing.
   Each one now writes a design token (the PM6 token contract on :root: --accent-primary, --border-width, --radius-*,
   --pm6-sb-size, the --xs..--3xl spacing steps, --body-font / --display-font) or a root attribute the styles below
   read. A setting that was never changed writes nothing, so every theme keeps its own corners, borders, fonts and
   accent until you choose otherwise. Text size, Line spacing and Animation speed scale the page's own font sizes,
   line heights and durations through one generated override sheet, which exists only while one of them is changed. */
const O55_LOOK_IDS = ['accent', 'animation-speed', 'sidebar-labels', 'general.visual.ui-scale', 'general.visual.font-size', 'general.visual.interface-density',
  'general.visual.line-height', 'general.visual.high-contrast', 'general.visual.focus-indicator', 'general.visual.app-font', 'general.visual.border-width',
  'general.visual.border-radius', 'general.visual.padding-scale', 'general.visual.scrollbar-width', 'general.visual.retro-effects',
  'general.visual.pixel-grid-opacity', 'general.visual.scanline-opacity', 'general.visual.theme', 'general.visual.theme-mode'];
/* Accent colors: a brighter shade for dark themes, a deeper one for light themes so text on it stays readable. */
const O55_ACCENTS = {
  Violet: { dark: ['#8b5cf6', '139,92,246'], light: ['#6d28d9', '109,40,217'] },
  Cyan: { dark: ['#22d3ee', '34,211,238'], light: ['#0e7490', '14,116,144'] },
  Rose: { dark: ['#fb7185', '251,113,133'], light: ['#be123c', '190,18,60'] },
  Amber: { dark: ['#fbbf24', '251,191,36'], light: ['#b45309', '180,83,9'] },
  Emerald: { dark: ['#34d399', '52,211,153'], light: ['#047857', '4,120,87'] }
};
const O55_SPEED = { Fast: 0.6, Measured: 1, Cinematic: 1.6 };
const O55_SPACING = ['--xs', '--sm', '--md', '--lg', '--xl', '--2xl', '--3xl'];
/* The value a person chose, or null while the row still has its default (the theme's own). */
function o55LookChosen(id) {
  const f = findSettingGlobal(id); if (!f || !state || !state.settings) return null;
  if (!Object.prototype.hasOwnProperty.call(state.settings, id)) return null;
  const v = state.settings[id];
  return v == null || String(v) === String(f.setting.value) ? null : v;
}
const o55Px = v => { const n = Number.parseFloat(v); return Number.isFinite(n) ? n : null; };
const o55On = v => v === true || v === 'true' || v === 'On';

/* ---------- the override sheet: font sizes, line heights and durations, scaled ---------------------------------------- */
let o55ScaleKey = '', o55ScaleSheet = null, o55ScaleRules = null;
function o55CollectScalable() {
  if (o55ScaleRules) return o55ScaleRules;
  const out = [];
  const walk = (rules, wrap) => {
    for (const r of rules) {
      if (r.type === 1 && r.style) {
        const pick = {};
        for (const p of ['font-size', 'line-height', 'transition-duration', 'animation-duration']) {
          const v = r.style.getPropertyValue(p); if (!v || /^(normal|inherit|initial|unset|revert|0s?|auto)$/.test(v.trim())) continue;
          pick[p] = [v.trim(), r.style.getPropertyPriority(p)];
        }
        if (Object.keys(pick).length) out.push({ sel: r.selectorText, wrap, pick });
      } else if (r.cssRules && (r.type === 4 || r.type === 12 || (r.conditionText && r.constructor && /Container|Supports|Media/.test(r.constructor.name)))) {
        const head = r.type === 4 ? `@media ${r.media.mediaText}` : r.type === 12 ? `@supports ${r.conditionText}` : `@container ${r.containerName || ''} ${r.conditionText}`;
        walk(r.cssRules, wrap.concat(head));
      }
    }
  };
  for (const sh of document.styleSheets) {
    if (sh.ownerNode && sh.ownerNode.id === 'o55-look-scale') continue;
    let rules = null; try { rules = sh.cssRules; } catch (e) { rules = null; }
    if (rules) walk(rules, []);
  }
  return (o55ScaleRules = out);
}
const o55SplitTop = v => { const parts = []; let depth = 0, cur = ''; for (const ch of v) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && !depth) { parts.push(cur.trim()); cur = ''; } else cur += ch; } parts.push(cur.trim()); return parts; };
function o55ScaledValue(p, v, k) {
  if (p === 'line-height' && /^[\d.]+$/.test(v)) return `calc(${v} * ${k})`;
  if (p === 'font-size' && /^(?:larger|smaller|x*-?small|medium|x*-?large|\d+(?:\.\d+)?%|[\d.]+em)$/.test(v)) return null; // relative: follows the parent
  if (/^(?:transition|animation)-duration$/.test(p)) return o55SplitTop(v).map(x => (/^0(?:\.0+)?m?s$/.test(x) ? x : `calc(${x} * ${k})`)).join(', ');
  return `calc(${v} * ${k})`;
}
function o55PaintScales(text, line, speed) {
  const key = `${text}|${line}|${speed}`; if (key === o55ScaleKey) return; o55ScaleKey = key;
  if (text === 1 && line === 1 && speed === 1) { if (o55ScaleSheet) { o55ScaleSheet.remove(); o55ScaleSheet = null; } return; }
  const k = { 'font-size': text, 'line-height': line, 'transition-duration': speed, 'animation-duration': speed };
  const blocks = [];
  for (const r of o55CollectScalable()) {
    const decl = Object.entries(r.pick).filter(([p]) => k[p] !== 1).map(([p, [v, imp]]) => { const s = o55ScaledValue(p, v, k[p]); return s ? `${p}:${s}${imp ? ' !important' : ''}` : ''; }).filter(Boolean).join(';');
    if (!decl) continue;
    blocks.push(r.wrap.reduceRight((inner, head) => `${head}{${inner}}`, `${r.sel}{${decl}}`));
  }
  if (!o55ScaleSheet) { o55ScaleSheet = document.createElement('style'); o55ScaleSheet.id = 'o55-look-scale'; }
  o55ScaleSheet.textContent = blocks.join('\n');
  document.head.appendChild(o55ScaleSheet);
}
/* Scripted animations (drawers, rows opening, the wizard) follow Animation speed too. */
let o55SpeedFactor = 1;
if (!Element.prototype.o55Animate) {
  Element.prototype.o55Animate = Element.prototype.animate;
  Element.prototype.animate = function (frames, opts) {
    if (o55SpeedFactor !== 1) {
      if (typeof opts === 'number') opts = opts * o55SpeedFactor;
      else if (opts && typeof opts === 'object') { opts = Object.assign({}, opts); if (typeof opts.duration === 'number') opts.duration *= o55SpeedFactor; if (typeof opts.delay === 'number') opts.delay *= o55SpeedFactor; }
    }
    return this.o55Animate(frames, opts);
  };
}

/* ---------- tokens and attributes ------------------------------------------------------------------------------------ */
let o55LookKey = '';
function o55ApplyLook() {
  if (!document.documentElement || !state || !state.settings) return;
  const V = id => o55LookChosen(id), html = document.documentElement, st = html.style;
  const key = O55_LOOK_IDS.map(id => JSON.stringify(state.settings[id] ?? null)).join('|') + '|' + (html.getAttribute('data-theme') || '') + '|' + window.innerWidth;
  if (key === o55LookKey) return; o55LookKey = key;
  const set = (name, val) => { if (val == null) st.removeProperty(name); else if (st.getPropertyValue(name) !== String(val)) st.setProperty(name, String(val)); };
  const attr = (name, val) => { if (val == null) html.removeAttribute(name); else if (html.getAttribute(name) !== val) html.setAttribute(name, val); };
  const light = /-light$/.test(html.getAttribute('data-theme') || '');
  /* Accent color */
  /* the theme's own accent, read with no override in place, for the first swatch */
  if (st.getPropertyValue('--accent-primary')) { st.removeProperty('--accent-primary'); st.removeProperty('--accent-primary-rgb'); }
  set('--o55-theme-accent', getComputedStyle(html).getPropertyValue('--accent-primary').trim() || null);
  const acc = O55_ACCENTS[V('accent')];
  const pick = acc ? acc[light ? 'light' : 'dark'] : null;
  set('--accent-primary', pick && pick[0]); set('--accent-primary-rgb', pick && pick[1]);
  /* Size of everything: the whole app, like the browser zoom */
  const ui = o55Px(V('general.visual.ui-scale'));
  if (document.body) document.body.style.zoom = ui && ui !== 100 ? String(ui / 100) : '';
  /* Spacing and Extra padding: the spacing steps every panel is built from */
  const dens = PM51.value('general.visual.interface-density') || 'Auto';
  const compact = dens === 'Compact' || (dens === 'Auto' && window.innerWidth < 1200);
  attr('data-density', compact ? 'compact' : null);
  const pad = (compact ? 0.8 : 1) * (o55Px(V('general.visual.padding-scale')) || 1);
  const base = { '--xs': 2, '--sm': 4, '--md': 8, '--lg': 12, '--xl': 16, '--2xl': 24, '--3xl': 32 };
  O55_SPACING.forEach(t => set(t, pad === 1 ? null : `${Math.round(base[t] * pad * 10) / 10}px`)); set('--density', pad === 1 ? null : String(pad));
  /* Border width, Corner roundness, Scrollbar width */
  const bw = o55Px(V('general.visual.border-width')); set('--border-width', bw == null ? null : `${bw}px`);
  const rad = o55Px(V('general.visual.border-radius'));
  [['--border-radius', 1], ['--radius-sm', 0.6], ['--radius-md', 1], ['--radius-lg', 1.6], ['--radius-xl', 2.2], ['--k3-radius-sm', 0.6], ['--k3-radius-md', 1], ['--k3-radius-lg', 1.6]]
    .forEach(([t, f]) => set(t, rad == null ? null : `${Math.round(rad * f)}px`));
  const sb = o55Px(V('general.visual.scrollbar-width')); set('--pm6-sb-size', sb == null ? null : `${sb}px`);
  /* App font: your computer's fonts in place of the theme's display fonts */
  const sys = V('general.visual.app-font') === 'System Fonts';
  set('--body-font', sys ? 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' : null); set('--display-font', sys ? 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' : null);
  attr('data-app-font', sys ? 'system' : null);
  /* High contrast (Basic themes) and the keyboard focus outline */
  attr('data-contrast', o55On(PM51.value('general.visual.high-contrast')) ? 'high' : null);
  const focus = V('general.visual.focus-indicator');
  attr('data-focus', focus === 'High contrast' ? 'high-contrast' : focus === 'Color-blind safe' ? 'color-blind' : null);
  /* Retro textures: the pixel grid on or off, and how strong the grid and scanlines are once changed */
  attr('data-retro-fx', o55On(PM51.value('general.visual.retro-effects')) ? null : 'off');
  const grid = V('general.visual.pixel-grid-opacity'), scan = V('general.visual.scanline-opacity');
  set('--o55-grid-a', grid == null ? null : String(Math.max(0, Math.min(0.3, Number(grid))) / 3));
  attr('data-o55-grid', grid == null ? null : 'set');
  set('--o55-scan-a', scan == null ? null : String(Math.max(0, Math.min(0.3, Number(scan)))));
  attr('data-o55-scan', scan == null || Number(scan) <= 0 ? null : 'on');
  /* Text size, Line spacing, Animation speed */
  const fs = o55Px(V('general.visual.font-size')), lh = o55Px(V('general.visual.line-height'));
  o55SpeedFactor = O55_SPEED[V('animation-speed')] || 1;
  o55PaintScales(fs ? Math.round(fs / 14 * 1000) / 1000 : 1, lh ? Math.round(lh / 1.4 * 1000) / 1000 : 1, o55SpeedFactor);
  /* Show names next to those icons: the rail's own expand state */
  o55SyncRail();
}
/* The rail keeps its own Expand/Collapse button; the setting mirrors it both ways, so the shell looks the same until
   you change either. */
function o55SyncRail() {
  const bar = document.getElementById('activityBar'), f = findSettingGlobal('sidebar-labels'); if (!bar || !f) return;
  const chosen = state.settings && Object.prototype.hasOwnProperty.call(state.settings, 'sidebar-labels') ? o55On(state.settings['sidebar-labels']) : null;
  if (chosen == null) { f.setting.value = !bar.classList.contains('collapsed'); return; }
  if (chosen === bar.classList.contains('collapsed')) { const t = document.getElementById('activityBarToggle'); if (t) t.click(); }
}
document.addEventListener('click', e => {
  if (!e.target || !e.target.closest || !e.target.closest('#activityBarToggle')) return;
  window.setTimeout(() => {
    const bar = document.getElementById('activityBar'); if (!bar || !state || !state.settings) return;
    const on = !bar.classList.contains('collapsed');
    if (Object.prototype.hasOwnProperty.call(state.settings, 'sidebar-labels') && o55On(state.settings['sidebar-labels']) !== on) { state.settings['sidebar-labels'] = on; saveState(); refreshSettingRow('sidebar-labels'); }
    const f = findSettingGlobal('sidebar-labels'); if (f && !Object.prototype.hasOwnProperty.call(state.settings, 'sidebar-labels')) f.setting.value = on;
  }, 0);
}, true);
const o55LookCommit = commitSettingValue;
commitSettingValue = function (id, value) {
  const ok = o55LookCommit.apply(this, arguments);
  if (ok && O55_LOOK_IDS.includes(id)) window.requestAnimationFrame(o55ApplyLook);
  return ok;
};
const o55LookRestore = restoreSettingDefault;
restoreSettingDefault = function (id) {
  const ok = o55LookRestore.apply(this, arguments);
  if (O55_LOOK_IDS.includes(id)) window.requestAnimationFrame(o55ApplyLook);
  return ok;
};
const o55LookRender = renderApp;
renderApp = function () { const r = o55LookRender.apply(this, arguments); o55ApplyLook(); return r; };
window.addEventListener('resize', () => { if ((PM51.value('general.visual.interface-density') || 'Auto') === 'Auto') o55ApplyLook(); });
/* A theme change repaints the look and redraws the rows that show the theme's own value. */
new MutationObserver(() => {
  o55ApplyLook();
  window.requestAnimationFrame(() => Object.keys(O55R).filter(id => O55R[id] && O55R[id].themeOwn).forEach(id => { if (root.querySelector(`[id="setting-${cssEscape(id)}"]`)) refreshSettingRow(id); }));
}).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
window.setTimeout(o55ApplyLook, 0);

/* ---------- Preview a theme before switching ------------------------------------------------------------------------- */
/* With the switch on, picking a theme shows it at once with a small bar: Keep it, or Go back; left alone it goes back
   after 15 seconds, like a display-settings change. With it off, the pick simply sticks. */
let o55Preview = null;
function o55PreviewEnd(keep) {
  const pv = o55Preview; if (!pv) return; o55Preview = null;
  window.clearInterval(pv.timer); if (pv.bar) pv.bar.remove();
  if (keep) { showToast('Theme kept', PM51.valueLabel('general.visual.theme', PM51.value('general.visual.theme')), 'success', 2200); return; }
  Object.entries(pv.before).forEach(([id, v]) => { if (v === undefined) restoreSettingDefault(id); else commitSettingValue(id, v); });
  saveState(); ['general.visual.theme', 'general.visual.theme-mode'].forEach(id => { if (root.querySelector(`[id="setting-${cssEscape(id)}"]`)) refreshSettingRow(id); });
  showToast('Back to your theme', PM51.valueLabel('general.visual.theme', PM51.value('general.visual.theme')), 'info', 2200);
}
const o55PreviewChange = handleChangeAction;
handleChangeAction = function (action, el) {
  const id = el && el.dataset ? el.dataset.setting : '';
  const watch = action === 'change-setting' && (id === 'general.visual.theme' || id === 'general.visual.theme-mode') && o55On(PM51.value('general.visual.theme-preview'));
  const before = watch && !o55Preview ? { 'general.visual.theme': state.settings['general.visual.theme'], 'general.visual.theme-mode': state.settings['general.visual.theme-mode'] } : null;
  const r = o55PreviewChange.apply(this, arguments);
  if (!watch) return r;
  if (o55Preview) { o55Preview.left = 15; return r; }
  const bar = document.createElement('div');
  bar.className = 'o55-preview-bar'; bar.setAttribute('role', 'status');
  bar.innerHTML = `<span class="o55-preview-text">Previewing ${h(PM51.valueLabel('general.visual.theme', PM51.value('general.visual.theme')))}. <span class="o55-preview-left">Going back in 15 s.</span></span><button type="button" data-o55-preview="keep">Keep it</button><button type="button" data-o55-preview="back">Go back</button>`;
  document.body.appendChild(bar);
  o55Preview = { before, bar, left: 15, timer: window.setInterval(() => {
    const pv = o55Preview; if (!pv) return; pv.left -= 1;
    const t = pv.bar.querySelector('.o55-preview-text'); if (t) t.innerHTML = `Previewing ${h(PM51.valueLabel('general.visual.theme', PM51.value('general.visual.theme')))}. <span class="o55-preview-left">Going back in ${pv.left} s.</span>`;
    if (pv.left <= 0) o55PreviewEnd(false);
  }, 1000) };
  return r;
};
document.addEventListener('click', e => { const b = e.target && e.target.closest ? e.target.closest('[data-o55-preview]') : null; if (b) o55PreviewEnd(b.dataset.o55Preview === 'keep'); });
