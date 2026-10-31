/* O55 · the look settings change the app. Only Theme, Light or dark, the Glass rows, Reduce motion and Where the chat
   sits were painted by the base; Accent color, Size of everything, Text size, Spacing, Line spacing, Animation speed,
   High contrast, Keyboard focus outline, App font, Border width, Corner roundness, Extra padding, Scrollbar width,
   the Retro texture strengths and Show names next to those icons were stored and did nothing.
   Each one now writes a design token (the PM6 token contract on :root: --accent-primary, --border-width, --radius-*,
   --pm6-sb-size, the --xs..--3xl spacing steps, --body-font / --display-font) or a root attribute the styles below
   read. A setting that was never changed writes nothing, so every theme keeps its own corners, borders, fonts and
   accent until you choose otherwise. Text size, Line spacing and Animation speed scale the page's own font sizes,
   line heights and durations through one generated override sheet, which exists only while one of them is changed. */
const O55_LOOK_IDS = ['general.visual.accent-color', 'general.visual.animation-speed', 'general.interaction.activity-bar-labels', 'general.visual.ui-scale', 'general.visual.font-size', 'general.visual.interface-density',
  'general.visual.line-height', 'general.visual.high-contrast', 'general.visual.focus-indicator', 'general.visual.app-font', 'general.visual.border-width',
  'general.visual.border-radius', 'general.visual.padding-scale', 'general.visual.scrollbar-width', 'general.visual.retro-effects',
  'general.visual.pixel-grid-opacity', 'general.visual.scanline-opacity', 'general.visual.theme', 'general.visual.theme-mode',
  'general.visual.nier-parts', 'general.visual.nier-background'];
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
        for (const p of ['font-size', 'line-height', 'transition-duration', 'transition-delay', 'animation-duration']) {
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
  if (/^(?:transition-(?:duration|delay)|animation-duration)$/.test(p)) return o55SplitTop(v).map(x => (/^0(?:\.0+)?m?s$/.test(x) ? x : `calc(${x} * ${k})`)).join(', ');
  return `calc(${v} * ${k})`;
}
function o55PaintScales(text, line, speed) {
  const key = `${text}|${line}|${speed}`; if (key === o55ScaleKey) return; o55ScaleKey = key;
  if (text === 1 && line === 1 && speed === 1) { if (o55ScaleSheet) { o55ScaleSheet.remove(); o55ScaleSheet = null; } return; }
  /* a transition's delay scales with its duration, so a late fade or a visibility deadline keeps its place in the motion
     it belongs to (the menu sprout's close: its 175 ms fade delay and 220 ms visibility deadline against its 220 ms
     collapse) */
  const k = { 'font-size': text, 'line-height': line, 'transition-duration': speed, 'transition-delay': speed, 'animation-duration': speed };
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

/* ---------- the accent and the tokens made from it ------------------------------------------------------------------ */
/* Themes derive a few tokens from their accent with its value written in: the soft and glow fills (--accent-soft,
   --accent-glow, the glass glow, the hover lift) and the scrollbar thumb in Retro; and the Basic, Glass and Friendly
   themes use their accent as their blue (--accent-blue), which draws the shell's active tab ink, the section tab
   underline, the changed-row mark and the switches' neighbours. Only --accent-primary was replaced, so those kept
   the old color: the ring on a chosen tab or item stayed the theme's blue after picking Violet. Each such token now
   has the theme's accent swapped for the chosen one (the hex and the "r,g,b" form); --accent-blue only where it is
   the theme's accent (Retro Dark's steel blue is its own color). html[data-o55-accent] lets CSS follow the rest. */
const O55_ACCENT_TOKENS = ['--accent-soft', '--accent-glow', '--elev-hover', '--glass-glow-color', '--pm6-sb-thumb', '--pm6-sb-thumb-hover'];
const o55AccentSet = new Set();
const o55Hex3 = hex => { const x = String(hex || '').trim().replace('#', ''); const f = x.length === 3 ? x.split('').map(c => c + c).join('') : x; return f.length === 6 ? [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)) : null; };
/* Reading a theme's own tokens is a getComputedStyle of <html>, which forces a style pass of the whole page; right
   after a theme or NieR repaint that pass is the full restyle (measured 717 ms at Project created, films M4). So the
   tokens are read only when an accent is chosen (they are what it replaces), once per painted theme (the cache below,
   keyed by the attributes the theme sheets select on), and a pass that changes neither the theme nor the accent
   touches nothing. With no accent chosen nothing is read: the swatch of the theme's own accent falls back to
   --accent-primary, which is then the theme's own. */
const o55ThemeTokens = new Map();
let o55AccentSig = null;
const o55ThemeKey = html => `${html.getAttribute('data-theme') || ''}|${html.getAttribute('data-o55-nier') || ''}|${html.getAttribute('data-contrast') || ''}`;
function o55AccentTokens(html, chosen, light) {
  const st = html.style;
  const acc = O55_ACCENTS[chosen], pick = acc ? acc[light ? 'light' : 'dark'] : null;
  const key = o55ThemeKey(html), sig = `${key}|${pick ? pick[0] : ''}`;
  if (sig === o55AccentSig && (!pick || st.getPropertyValue('--accent-primary') === pick[0])) return;
  o55AccentSig = sig;
  /* drop what this function wrote (removing a property that is not there would still be a write) */
  ['--accent-primary', '--accent-primary-rgb', ...o55AccentSet].forEach(n => { if (st.getPropertyValue(n)) st.removeProperty(n); });
  o55AccentSet.clear();
  if (!pick) {
    if (html.hasAttribute('data-o55-accent')) html.removeAttribute('data-o55-accent');
    ['--o55-on-accent', '--o55-theme-accent'].forEach(n => { if (st.getPropertyValue(n)) st.removeProperty(n); });
    return;
  }
  let theme = o55ThemeTokens.get(key);
  if (!theme) {
    const cs = getComputedStyle(html);
    theme = {}; ['--accent-primary', '--accent-blue', ...O55_ACCENT_TOKENS].forEach(n => { theme[n] = cs.getPropertyValue(n).trim(); });
    o55ThemeTokens.set(key, theme);
  }
  const themeHex = theme['--accent-primary'];
  if (themeHex) st.setProperty('--o55-theme-accent', themeHex); else st.removeProperty('--o55-theme-accent');
  const put = (n, v) => { st.setProperty(n, v); o55AccentSet.add(n); };
  put('--accent-primary', pick[0]); put('--accent-primary-rgb', pick[1]);
  const from = o55Hex3(themeHex), to = pick[1].split(',').map(Number);
  if (from) {
    const hexRe = new RegExp(themeHex.replace(/[^#\w]/g, ''), 'ig');
    const rgbRe = new RegExp(`\\b${from[0]}\\s*,\\s*${from[1]}\\s*,\\s*${from[2]}\\b`, 'g');
    O55_ACCENT_TOKENS.forEach(n => {
      const v = theme[n]; if (!v) return;
      const next = v.replace(hexRe, pick[0]).replace(rgbRe, to.join(','));
      if (next !== v) put(n, next);
    });
    const blue = o55Hex3(theme['--accent-blue']);
    if (blue && blue.join() === from.join()) { put('--accent-blue', pick[0]); put('--accent-blue-rgb', pick[1]); }
  }
  html.setAttribute('data-o55-accent', String(chosen).toLowerCase());
  const lum = to.map(c => { const x = c / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
  put('--o55-on-accent', 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2] > 0.4 ? '#101114' : '#fff');
}

/* ---------- tokens and attributes ------------------------------------------------------------------------------------ */
let o55LookKey = '';
function o55ApplyLook() {
  if (!document.documentElement || !state || !state.settings) return;
  /* NieR Mode first (kit.d/18-nier.js): a changed switch starts its transition, and while it is painted it decides the
     accent and the font below */
  o55NierApply();
  const nier = o55NierIsPainted();
  const V = id => o55LookChosen(id), html = document.documentElement, st = html.style;
  const key = O55_LOOK_IDS.map(id => JSON.stringify(state.settings[id] ?? null)).join('|') + '|' + (html.getAttribute('data-theme') || '') + '|' + window.innerWidth + '|' + nier;
  if (key === o55LookKey) return; o55LookKey = key;
  const set = (name, val) => { if (val == null) st.removeProperty(name); else if (st.getPropertyValue(name) !== String(val)) st.setProperty(name, String(val)); };
  const attr = (name, val) => { if (val == null) html.removeAttribute(name); else if (html.getAttribute(name) !== val) html.setAttribute(name, val); };
  const light = /-light$/.test(html.getAttribute('data-theme') || '');
  /* Accent color. The theme's own accent is read with no override in place (for the first swatch); a chosen one
     replaces it in --accent-primary and in every theme token derived from it (o55AccentTokens). */
  o55AccentTokens(html, nier ? null : V('general.visual.accent-color'), light);
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
  const sys = !nier && V('general.visual.app-font') === 'System Fonts';
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
  o55SpeedFactor = O55_SPEED[V('general.visual.animation-speed')] || 1;
  o55PaintScales(fs ? Math.round(fs / 14 * 1000) / 1000 : 1, lh ? Math.round(lh / 1.4 * 1000) / 1000 : 1, o55SpeedFactor);
  /* Show names next to those icons: the rail's own expand state */
  o55SyncRail();
}
/* The rail keeps its own Expand/Collapse button; the setting mirrors it both ways, so the shell looks the same until
   you change either. */
function o55SyncRail() {
  const bar = document.getElementById('activityBar'), f = findSettingGlobal('general.interaction.activity-bar-labels'); if (!bar || !f) return;
  const chosen = state.settings && Object.prototype.hasOwnProperty.call(state.settings, 'general.interaction.activity-bar-labels') ? o55On(state.settings['general.interaction.activity-bar-labels']) : null;
  if (chosen == null) { f.setting.value = !bar.classList.contains('collapsed'); return; }
  if (chosen === bar.classList.contains('collapsed')) { const t = document.getElementById('activityBarToggle'); if (t) t.click(); }
}
document.addEventListener('click', e => {
  if (!e.target || !e.target.closest || !e.target.closest('#activityBarToggle')) return;
  window.setTimeout(() => {
    const bar = document.getElementById('activityBar'); if (!bar || !state || !state.settings) return;
    const on = !bar.classList.contains('collapsed');
    if (Object.prototype.hasOwnProperty.call(state.settings, 'general.interaction.activity-bar-labels') && o55On(state.settings['general.interaction.activity-bar-labels']) !== on) { state.settings['general.interaction.activity-bar-labels'] = on; saveState(); refreshSettingRow('general.interaction.activity-bar-labels'); }
    const f = findSettingGlobal('general.interaction.activity-bar-labels'); if (f && !Object.prototype.hasOwnProperty.call(state.settings, 'general.interaction.activity-bar-labels')) f.setting.value = on;
  }, 0);
}, true);
const o55LookCommit = commitSettingValue;
commitSettingValue = function (id, value) {
  const ok = o55LookCommit.apply(this, arguments);
  if (ok && O55_LOOK_IDS.includes(id)) window.requestAnimationFrame(o55ApplyLook);
  if (id === 'general.visual.theme' || id === 'general.visual.theme-mode') window.requestAnimationFrame(o55SyncThemeControls);
  return ok;
};
const o55LookRestore = restoreSettingDefault;
restoreSettingDefault = function (id) {
  const ok = o55LookRestore.apply(this, arguments);
  if (O55_LOOK_IDS.includes(id)) window.requestAnimationFrame(o55ApplyLook);
  if (id === 'general.visual.theme' || id === 'general.visual.theme-mode') window.requestAnimationFrame(o55SyncThemeControls);
  return ok;
};
const o55LookRender = renderApp;
renderApp = function () { const r = o55LookRender.apply(this, arguments); o55ApplyLook(); return r; };
window.addEventListener('resize', () => { if ((PM51.value('general.visual.interface-density') || 'Auto') === 'Auto') o55ApplyLook(); });
/* A theme change repaints the look and redraws the rows that show the theme's own value. */
new MutationObserver(() => {
  o55ApplyLook();
  o55SyncGlassNumber();
  window.requestAnimationFrame(() => Object.keys(O55R).filter(id => O55R[id] && O55R[id].themeOwn).forEach(id => PM51.refreshSavedRow(id)));
}).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
window.setTimeout(o55ApplyLook, 0);

/* Theme and Light or dark are one saved choice. A commit changes both values, so both hidden selects and their
   visible labels must follow it. Otherwise Light stays labelled Dark and choosing Dark emits no change event.
   A refused write also restores the optimistic dropdown label. Keep the rows in place (the wallpaper follows them). */
function o55SyncThemeControls() {
  ['general.visual.theme', 'general.visual.theme-mode'].forEach(id => {
    const found = findSettingGlobal(id); if (!found) return;
    root.querySelectorAll(`select[data-setting="${id}"]`).forEach(sel => {
      sel.value = settingValue(found.setting);
      const label = sel.closest('.pm51-dd')?.querySelector('.pm51-dd-value'), option = sel.options[sel.selectedIndex];
      if (label && option) label.textContent = option.textContent;
    });
    o55MarkChanged(id);
  });
  o55SyncGlassNumber();
}

/* The existing percent stepper keeps its .01 alpha increments. Its adjacent field uses the existing number
   control and input styles, shows the same percentage, and accepts fractional percentages. The stored alpha and
   --glass-alpha stay in .35/.45..1, with the existing dark/light readability floors. */
const O55_GLASS_ALPHA_ID = 'general.visual.glass-transparency';
const o55GlassPercent = value => Number((Number(value) * 100).toPrecision(15));
const o55GlassMinPercent = () => /-light$/.test(document.documentElement.getAttribute('data-theme') || '') ? 45 : 35;
const o55GlassShownAlpha = () => window.PM7_SETTINGS_TOME.clampGlassAlpha(state.settings, PM51.value(O55_GLASS_ALPHA_ID));
const o55LookControl = renderControl;
renderControl = function (setting, value) {
  if (setting && setting.id === O55_GLASS_ALPHA_ID) value = window.PM7_SETTINGS_TOME.clampGlassAlpha(state.settings, value);
  const control = o55LookControl.call(this, setting, value);
  if (!setting || setting.id !== O55_GLASS_ALPHA_ID) return control;
  const number = o55Number(Object.assign({}, setting, { min: o55GlassMinPercent(), max: 100, unit: '%', label: PM51.rowLabel(setting) }), o55GlassPercent(value))
    .replace('data-action="input-setting"', 'data-action="o55-glass-alpha"');
  return `<span class="o55-inherit">${control}${number}</span>`;
};
/* Details, toasts and search say the value the way the row does: the stored alpha (.56) as the row's stepper shows it
   (56%), after the same readability floor, never as "0.56 %" (contrast round, 2026-10-15). */
const o55LookValueText = PM51.valueText;
PM51.valueText = (setting, v) => {
  if (!setting || setting.id !== O55_GLASS_ALPHA_ID || v == null || v === '' || !Number.isFinite(Number(v))) return o55LookValueText(setting, v);
  return `${Math.round(o55GlassPercent(window.PM7_SETTINGS_TOME.clampGlassAlpha(state.settings, v)))}%`;
};
function o55SyncGlassNumber() {
  const shown = o55GlassPercent(o55GlassShownAlpha());
  root.querySelectorAll(`input[data-action="o55-glass-alpha"]`).forEach(el => {
    el.min = String(o55GlassMinPercent());
    if (document.activeElement !== el) el.value = String(shown);
  });
  root.querySelectorAll(`[id="setting-${O55_GLASS_ALPHA_ID}"] .stepper-value`).forEach(el => { el.textContent = `${Math.round(shown)}%`; });
}
const o55LookInput = handleInputAction;
handleInputAction = function (action, el) {
  if (action !== 'o55-glass-alpha') return o55LookInput.apply(this, arguments);
  if (!el || el.dataset.setting !== O55_GLASS_ALPHA_ID || !el.value.trim() || el.validity.badInput) return;
  const number = Number(el.value); if (!Number.isFinite(number)) return;
  const value = Math.max(o55GlassMinPercent(), Math.min(100, number)) / 100;
  if (!commitSettingValue(O55_GLASS_ALPHA_ID, value)) return;
  saveState(); o55MarkChanged(O55_GLASS_ALPHA_ID); o55Notify(O55_GLASS_ALPHA_ID, PM51.value(O55_GLASS_ALPHA_ID)); o55SyncGlassNumber();
};
document.addEventListener('focusout', e => {
  const el = e.target;
  if (el && el.matches && el.matches('input[data-action="o55-glass-alpha"]')) el.value = String(o55GlassPercent(o55GlassShownAlpha()));
});

/* Light or dark on Auto (QA2 m2): the Theme's word never contradicts the screen. While the mode is Auto the stored Theme
   follows what the computer paints ("Glass Light" on a light computer, in every family, NieR included), when a Project
   opens and when the computer's setting changes, even with Settings open. Only the Theme is written (commitSettingValues,
   not the paired commit), so the person's Auto stays Auto. Choosing Auto writes the matching word itself
   (pm4-settings-js.js commitSettingValue). A read-only owner projection is left alone. */
const o55AutoMq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
function o55AutoThemeWord() {
  if (!state || !state.settings || state.settingsProjectionReadOnly) return null;
  if (!/^auto$/i.test(String(state.settings['general.visual.theme-mode'] || ''))) return null;
  const cur = String(state.settings['general.visual.theme'] || 'Basic Dark').trim();
  const want = (cur.split(/\s+/)[0] || 'Basic') + ' ' + (o55AutoMq && o55AutoMq.matches ? 'Dark' : 'Light');
  return want === cur ? null : want;
}
let o55AutoPending = 0;
function o55AutoFollow() {
  o55AutoPending = 0;
  const want = o55AutoThemeWord(); if (!want) return;
  if (!commitSettingValues({ 'general.visual.theme': want })) return;
  saveState();
  o55SyncThemeControls();
  if (typeof PM51.refreshSavedRow === 'function') PM51.refreshSavedRow('general.visual.theme');
}
/* never inside a render or a paint: the next task */
function o55AutoFollowSoon() { if (!o55AutoPending && o55AutoThemeWord()) o55AutoPending = window.setTimeout(o55AutoFollow, 0); }
if (o55AutoMq) { if (o55AutoMq.addEventListener) o55AutoMq.addEventListener('change', o55AutoFollowSoon); else if (o55AutoMq.addListener) o55AutoMq.addListener(o55AutoFollowSoon); }
const o55AutoRender = renderApp;
renderApp = function () { const r = o55AutoRender.apply(this, arguments); o55AutoFollowSoon(); return r; };
