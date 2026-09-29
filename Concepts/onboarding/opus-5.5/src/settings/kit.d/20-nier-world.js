/* O55 · NieR Mode World parts, the script half (12 of the 29; the styles are styles.d/15-nier-world.css, the other 17
   parts kit.d/19-nier-parts.js, the Plug-in Chips editor kit.d/22-nier-chips.js). Contract: kit.d/18-nier.js. A part is
   live while PM_NIER.has(key); each part below installs when its key arrives and removes all it added when it goes, so
   every part is silent while NieR Mode is off.
     boot       once, when the app opens with NieR Mode on: #o55nw-boot, a one-second mono log over the boot paint
     readouts   the status bar's SYS / NET / AI / CTX readout; CTX is the Usage context budget (PM7_USAGE.data.context,
                else PM_DEMO's chat context) as a twelve-cell HP bar; AI is the providers' own summary
     quests     #o55nw-quest, a wide ink band on three real events: the Wizard's Approve And Build (PM_DEMO
                'wizard.approved'), a run reaching complete (PM_DEMO 'run.state'), the Guided Tour finished ('o55:tour')
     save       #o55nw-save: every committed Settings change shows "Saving…" beside a turning diamond, then "Data saved"
     blocks, charts, ticks, glyphs, intel, icons, empty   CSS only (the parts attribute); glyphs and empty read the line art
                that this file writes once as custom properties per mode (--o55nw-art-*)
     pod042     src/js/84-pod042-chat.js (the chat adapter and its fallback); CSS hides the persona while it is off
   Performance (README "Performance rules"): no requestAnimationFrame loop and no MutationObserver; the readout reads
   two numbers on the chat's own events and every 20 s while shown, and writes only what changed. Motion is CSS or Web
   Animations of transform and opacity, one shot, scaled by Animation speed; sounds are the parts' synth
   (PM_NIER_PARTS.play), so they follow Menu sounds and general.interaction.sound-effects. */
(function o55NierWorldModule() {
  const root = document.documentElement;
  const NIER = () => window.PM_NIER || null;
  const has = key => { const n = NIER(); try { return !!(n && n.has(key)); } catch (e) { return false; } };
  const still = () => {
    try { if (o55Still()) return true; } catch (e) { /* the motion layer is not read yet */ }
    return root.getAttribute('data-motion') === 'reduced' || !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  const speed = () => { try { return o55SpeedFactor || 1; } catch (e) { return 1; } };
  const later = (fn, ms) => window.setTimeout(fn, Math.round(ms * speed()));
  const onboarding = () => root.hasAttribute('data-o55-open');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const play = name => { try { const P = window.PM_NIER_PARTS; return !!(P && typeof P.play === 'function' && P.play(name)); } catch (e) { return false; } };
  const layer = (id, tag) => { const e = document.createElement(tag || 'div'); e.id = id; e.setAttribute('aria-hidden', 'true'); document.body.appendChild(e); return e; };

  /* ---------- line art: written once as data: SVG custom properties, one set per mode ------------------------------ */
  /* An image cannot read a CSS variable, so the two inks are written here: the theme's own text colours
     (nier/nier-automata.json: light #211f1b, dark #d1cdb7). All three drawings are original. */
  const INK = { light: '#211f1b', dark: '#d1cdb7' };
  const SVG_OPEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="INK" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter">';
  const ART = {
    /* the Pod: a chamfered box with a sensor slit, two side arms and a skirt, over its shadow */
    pod: SVG_OPEN + '<path d="M22 12H42L46 16V40L41 45H23L18 40V16Z M20 19.5H44 M22 36H42 M22 39.5H42 M25 45L27 50H37L39 45"/>'
      + '<path d="M10 20H16V38H10Z M48 20H54V38H48Z M16 25H18 M46 25H48 M13 15V20 M51 15V20"/>'
      + '<path d="M25 25H39V29H25Z" fill="INK" stroke="none"/>'
      + '<path d="M24 57H40" stroke-opacity=".4"/></svg>',
    /* a small machine lifeform, all boxes: a head with two round eyes and an antenna, a body with a hatch, pipe arms */
    machine: SVG_OPEN + '<path d="M20 11H44V28H20Z M32 11V6 M29 6H35 M28 28V31 M36 28V31 M18 31H46V49H18Z M24 36H40V44H24Z M24 40H40"/>'
      + '<circle cx="27" cy="19.5" r="3"/><circle cx="37" cy="19.5" r="3"/><path d="M26.5 19.5H27.5 M36.5 19.5H37.5"/>'
      + '<path d="M18 35H12V46 M46 35H52V46 M10 46H14 M50 46H54 M23 49V56H29V49 M35 49V56H41V49 M20 56H31 M33 56H44"/></svg>',
    /* a flower with five pointed petals on a long stem, two leaves */
    flower: SVG_OPEN + '<g>' + [0, 72, 144, 216, 288].map(r => `<path transform="rotate(${r} 32 22)" d="M32 22C28.5 17 28.5 11 32 6C35.5 11 35.5 17 32 22Z"/>`).join('')
      + '</g><circle cx="32" cy="22" r="2.2" fill="INK" stroke="none"/><path d="M32 25C31 35 33 46 32 58 M22 58H42"/>'
      + '<path d="M31.8 44C26 42.5 22 38 21 33.5C27 34.5 30.5 38.5 31.8 44Z M32.2 50.5C38 49 42 44.5 43 40C37 41 33.5 45 32.2 50.5Z"/></svg>'
  };
  /* machine glyphs: twenty-one cells of 4 x 4 strokes with small word gaps, from a fixed seed (the same every time) */
  function glyphStrip() {
    let s = 0x5eed042;
    const rnd = () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    let d = '';
    for (let k = 0; k < 21; k++) {
      if (k % 5 === 4) continue; /* a word gap */
      const x = k * 6 + 0.5, strokes = [
        () => `M${x} .5V4.5`, () => `M${x + 3} .5V4.5`, () => `M${x + 1.5} .5V4.5`, () => `M${x} .5H${x + 3}`, () => `M${x} 2.5H${x + 3}`,
        () => `M${x} 4.5H${x + 3}`, () => `M${x + 1} 1.5H${x + 2}V2.5H${x + 1}Z`, () => `M${x} 4.5L${x + 3} .5`];
      const n = 2 + Math.floor(rnd() * 2), used = new Set();
      while (used.size < n) used.add(Math.floor(rnd() * strokes.length));
      used.forEach(i => { d += strokes[i](); });
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 126 5" fill="none" stroke="INK" stroke-width="1" stroke-opacity=".6" stroke-linecap="square"><path d="${d}"/></svg>`;
  }
  ART.glyphs = glyphStrip();
  function artSheet() {
    if (document.getElementById('o55nw-art')) return;
    const uri = (svg, ink) => `url("data:image/svg+xml,${encodeURIComponent(svg.split('INK').join(ink))}")`;
    const block = mode => Object.keys(ART).map(k => `--o55nw-art-${k}: ${uri(ART[k], INK[mode])};`).join(' ');
    const st = document.createElement('style');
    st.id = 'o55nw-art';
    st.textContent = `html[data-o55-nier][data-theme="basic-light"] { ${block('light')} }\nhtml[data-o55-nier][data-theme="basic-dark"] { ${block('dark')} }`;
    (document.head || root).appendChild(st);
  }
  artSheet();

  /* ---------- the part registry ------------------------------------------------------------------------------------ */
  const PARTS = {};
  const live = new Set();
  function sync() {
    if (!document.body) return;
    Object.keys(PARTS).forEach(key => {
      const want = has(key);
      if (want === live.has(key)) return;
      if (want) live.add(key); else live.delete(key);
      try { PARTS[key][want ? 'on' : 'off'](); } catch (e) { /* a part never breaks the app */ }
    });
  }

  /* ---------- boot sequence ------------------------------------------------------------------------------------------ */
  const BOOT_LINES = [['System check', 'OK'], ['Loading personal data', 'OK'], ['Connecting to Bunker', 'OK'], ['Mounting project data', 'OK'], ['Interface', 'NieR Mode']];
  let bootChecked = false, bootEl = null;
  function bootEnd() {
    const el = bootEl; bootEl = null; if (!el) return;
    document.removeEventListener('keydown', bootEnd, true); document.removeEventListener('pointerdown', bootEnd, true);
    el.remove();
  }
  function boot() {
    if (bootChecked) return false;
    bootChecked = true;
    if (!has('boot') || still() || onboarding() || document.hidden || !document.body) return false;
    const el = bootEl = layer('o55nw-boot');
    el.innerHTML = '<div class="o55nw-boot-log"><div class="o55nw-boot-head"><small>YoRHa unit · Puppet Master</small>Boot sequence</div>'
      + BOOT_LINES.map(([t, ok], i) => `<div class="o55nw-boot-line" style="--i:${i}"><span>${esc(t)}</span><i></i><b>${esc(ok)}</b></div>`).join('')
      + '<div class="o55nw-boot-meter"><i></i></div></div>';
    el.addEventListener('animationend', e => { if (e.target === el) bootEnd(); });
    document.addEventListener('keydown', bootEnd, true); document.addEventListener('pointerdown', bootEnd, true);
    later(bootEnd, 1600); /* in case the page never paints the animation (a hidden tab) */
    return true;
  }
  PARTS.boot = { on() {}, off() { bootEnd(); } };

  /* ---------- unit readouts ------------------------------------------------------------------------------------------ */
  let ro = null, roTimer = 0, roLast = '';
  const k = n => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}K` : String(Math.round(n)));
  function context() {
    try { const c = window.PM7_USAGE && window.PM7_USAGE.data && window.PM7_USAGE.data.context; if (c && c.limit > 0) return { used: +c.used || 0, max: +c.limit }; } catch (e) { /* fall through */ }
    try { const c = window.PM_DEMO.state.chat.context; if (c && c.max > 0) return { used: +c.used || 0, max: +c.max }; } catch (e) { /* none */ }
    return null;
  }
  function roUpdate() {
    if (!ro || !ro.isConnected) return;
    let ai = ''; try { ai = typeof window.O55ProviderSummary === 'function' ? window.O55ProviderSummary() : ''; } catch (e) { ai = ''; }
    const c = context(), free = c ? Math.max(0, c.max - c.used) : 0, hp = c ? Math.round(12 * free / c.max) : 0;
    const key = `${ai}|${c ? c.used + '/' + c.max : ''}`;
    if (key === roLast) return; roLast = key;
    const aiEl = ro.querySelector('.o55nw-ai'), ind = ro.querySelector('.o55nw-ind'), bar = ro.querySelector('.o55nw-hp'), ctx = ro.querySelector('.o55nw-ctx');
    aiEl.textContent = ai || 'Offline';
    ind.dataset.state = !ai || /^0 ready/.test(ai) ? 'off' : /attention/.test(ai) ? 'warn' : 'on';
    bar.style.setProperty('--hp', String(hp));
    bar.toggleAttribute('data-low', !!c && free / c.max < 0.2);
    ctx.textContent = c ? `${k(free)} left` : '—';
    const words = c ? `Context left: ${k(free)} of ${k(c.max)} tokens` : 'Context budget not known yet';
    const item = bar.parentElement; item.setAttribute('aria-label', words); item.setAttribute('data-pm-hover-label', words);
  }
  function roInstall() {
    const bar = document.getElementById('pm7GlobalStatusBar');
    if (!bar || ro) return !!ro;
    const net = [...bar.querySelectorAll('.pm7-statusitem')].find(e => /^Execution host/i.test(e.textContent.trim()));
    if (net) net.setAttribute('data-o55nw-label', 'NET');
    ro = document.createElement('div');
    ro.className = 'pm7-statusbar-group o55nw-readout';
    ro.innerHTML = '<span class="pm7-statusitem" data-o55nw-label="AI"><i class="o55nw-ind"></i><span class="o55nw-ai"></span></span>'
      + '<span class="pm7-statusitem" data-o55nw-label="CTX" role="img"><span class="o55nw-hp"><i></i></span><span class="o55nw-ctx"></span></span>';
    const grow = bar.querySelector('.pm7-statusbar-grow');
    bar.insertBefore(ro, grow ? grow.nextSibling : null);
    roLast = ''; roUpdate();
    roTimer = window.setInterval(() => { if (!document.hidden) roUpdate(); }, 20000);
    return true;
  }
  PARTS.readouts = {
    on() { roInstall(); },
    off() {
      if (roTimer) window.clearInterval(roTimer); roTimer = 0;
      if (ro) ro.remove(); ro = null;
      document.querySelectorAll('#pm7GlobalStatusBar [data-o55nw-label]').forEach(e => e.removeAttribute('data-o55nw-label'));
    }
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden && ro) roUpdate(); });

  /* ---------- quest banners ------------------------------------------------------------------------------------------ */
  let quest = null;
  function questEnd(el) { if (el && el.isConnected) el.remove(); if (quest === el) quest = null; }
  function banner(kicker, title, line) {
    if (!live.has('quests') || !document.body || document.hidden || onboarding()) return false;
    if (quest) questEnd(quest);
    const el = quest = document.createElement('div');
    el.id = 'o55nw-quest'; el.setAttribute('role', 'status');
    el.innerHTML = `<div class="o55nw-q-band"></div><div class="o55nw-q-copy"><span class="o55nw-q-mark" aria-hidden="true"></span><span class="o55nw-q-kicker">${esc(kicker)}</span>`
      + `<span class="o55nw-q-title">${esc(title)}</span><span class="o55nw-q-line">${esc(line)}</span></div>`;
    document.body.appendChild(el);
    play('confirm');
    if (still() || typeof el.animate !== 'function') { later(() => questEnd(el), 2800); return true; }
    const band = el.firstElementChild, copy = el.lastElementChild;
    band.animate([{ transform: 'scaleY(.012)', opacity: 1 }, { transform: 'scaleY(1)', opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.2, .85, .25, 1)', fill: 'backwards' });
    copy.animate([{ opacity: 0, easing: 'step-end' }, { opacity: 1, offset: 0.3, easing: 'step-end' }, { opacity: 0.25, offset: 0.5, easing: 'step-end' }, { opacity: 1, offset: 0.7 }, { opacity: 1 }],
      { duration: 320, delay: 160, fill: 'backwards' });
    later(() => {
      if (!el.isConnected) return;
      copy.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'steps(3, end)', fill: 'forwards' });
      const a = band.animate([{ transform: 'scaleY(1)', opacity: 1 }, { transform: 'scaleY(.012)', opacity: 1, offset: 0.8 }, { transform: 'scaleY(.012)', opacity: 0 }],
        { duration: 300, delay: 90, easing: 'cubic-bezier(.6, 0, .8, .3)', fill: 'forwards' });
      a.onfinish = () => questEnd(el); a.oncancel = () => questEnd(el);
    }, 2600);
    return true;
  }
  PARTS.quests = { on() {}, off() { if (quest) questEnd(quest); } };
  let runState = null, demoWired = false;
  function wireDemo() {
    const D = window.PM_DEMO; if (demoWired || !D || typeof D.on !== 'function') return;
    demoWired = true;
    try { runState = D.state && D.state.run ? D.state.run.stage : null; } catch (e) { runState = null; }
    D.on('wizard.approved', p => {
      const run = (p && p.runId) || 'pcr-47';
      banner('Planning Wizard', 'Plan approved', p && p.replay ? `This plan was already built as run ${run}.` : `Run ${run} is set up; the Orchestrator shows it building.`);
    });
    D.on('run.state', s => {
      const now = s && (s.state || s.stage), before = runState; runState = now;
      if (now !== 'complete' || !before || before === 'complete') return;
      const h = s.history && s.history[0], what = h && h.label ? h.label : `Run ${s.id || ''}`.trim();
      banner('Orchestrator', 'Build complete', `${what}. Create PR is unlocked in Source Control.`);
    });
    D.on('chat.state', () => { if (ro) roUpdate(); });
  }
  window.addEventListener('o55:tour', e => {
    const d = e && e.detail; if (!d || d.type !== 'finished') return;
    /* after the tour's own closing motion */
    later(() => banner('Guided Tour', 'Tour complete', d.keep ? 'You kept what you changed during the tour.' : 'Your workspace is back the way it was before the tour.'), 700);
  });

  /* ---------- save signal ------------------------------------------------------------------------------------------- */
  let save = null, saveTimers = [];
  const saveClear = () => { saveTimers.forEach(t => window.clearTimeout(t)); saveTimers = []; };
  function saveSignal() {
    if (!live.has('save') || !document.body || onboarding()) return;
    if (!save) { save = layer('o55nw-save'); save.setAttribute('aria-hidden', 'false'); save.setAttribute('role', 'status'); save.innerHTML = '<i aria-hidden="true"></i><span></span>'; }
    saveClear();
    const text = save.lastElementChild, set = (st, words) => { save.dataset.state = st; if (words != null && text.textContent !== words) text.textContent = words; };
    set('saving', 'Saving…');
    saveTimers.push(later(() => {
      set('done', 'Data saved');
      saveTimers.push(later(() => { set('gone'); saveTimers.push(later(() => { if (save) delete save.dataset.state; }, 220)); }, 1500));
    }, 520));
  }
  PARTS.save = { on() {}, off() { saveClear(); if (save) save.remove(); save = null; } };
  const o55nwCommit = commitSettingValue;
  commitSettingValue = function () {
    const ok = o55nwCommit.apply(this, arguments);
    if (ok) { try { saveSignal(); } catch (e) { /* decoration only */ } }
    return ok;
  };
  const o55nwRestore = restoreSettingDefault;
  restoreSettingDefault = function () {
    const ok = o55nwRestore.apply(this, arguments);
    if (ok) { try { saveSignal(); } catch (e) { /* decoration only */ } }
    return ok;
  };

  /* CSS-only parts, listed so the registry reports them */
  ['blocks', 'charts', 'ticks', 'glyphs', 'intel', 'icons', 'empty', 'pod042'].forEach(key => { PARTS[key] = { on() {}, off() {} }; });

  /* ---------- wiring ------------------------------------------------------------------------------------------------ */
  function start() {
    const n = NIER(); if (!n) return false;
    n.onChange(info => {
      sync();
      if (info && info.reason === 'init' && info.on) boot(); else bootChecked = true;
    });
    return true;
  }
  if (!start()) window.setTimeout(start, 0);
  /* NieR Mode may have been read before this file ran: the first look decides whether this opening boots */
  window.setTimeout(() => { if (!bootChecked) { const n = NIER(); if (n && n.on()) { sync(); boot(); } else bootChecked = true; } }, 0);
  const ready = () => { wireDemo(); sync(); if (live.has('readouts')) roInstall(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  window.addEventListener('load', ready);
  window.setTimeout(sync, 0);

  /* test hooks */
  window.PM_NIER_WORLD = Object.freeze({
    live: () => [...live],
    sync,
    readout: () => (ro ? { ai: ro.querySelector('.o55nw-ai').textContent, hp: ro.querySelector('.o55nw-hp').style.getPropertyValue('--hp'), ctx: ro.querySelector('.o55nw-ctx').textContent } : null),
    art: key => ART[key] || ''
  });
})();
