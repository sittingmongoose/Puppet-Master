/* nier_fx_bench.js — a test bench for O55.nierFx (src/js/16-nier-fx.js). Not part of the built page: tests load it
   into a built page with Playwright, e.g.
     await page.addScriptTag({ path: 'Concepts/onboarding/opus-5.5/tools/nier_fx_bench.js' });
     const names = await page.evaluate(() => { window.__b = O55FxBench.mount(document.body); return window.__b.names; });
     await page.evaluate((n) => window.__b.run(n), 'hang');
   It draws sample elements (plain page tokens, so it reads in any look) and plays each effect on them. The effects
   themselves still need NieR Mode painted and their parts installed (PM_NIER.set(true)).
     O55FxBench.mount(host) -> { el, names, run(name) -> Promise, runAll() -> Promise, dispose() }
   O55.nierFx.demo(host) is the same mount, for older test scripts. */
(function () {
  'use strict';
  const O55 = window.O55;
  if (!O55 || !O55.nierFx) return;
  const FX = O55.nierFx;
  const WORDS = {
    kicker: 'Effects bench', title: 'Pick a look for your workspace', short: 'OK 04/05',
    slice: 'Slice open', sliceSub: 'A panel opens from one line.', wipe: 'Page wipe', wipeSub: 'A band covers it and steps away.',
    glitch: 'Glitch', glitchSub: 'A short tear.', alert: 'Alert', alertSub: 'A tear, a scan line and ink shards.',
    rowA: 'Start a new Project', rowB: 'Open a Project I already have', rowC: 'Connect to another computer',
    podButton: 'Ask Pod 042', podLine: 'Proposal: Choose a look, then press Continue.',
    bannerTitle: 'Look chosen', bannerSub: 'Pictures, movement and sound follow it.',
    actKicker: 'Chapter complete', actTitle: 'Welcome', actSub: 'Next: Computer',
    logKicker: 'Puppet Master // setup', log: [['Checking this computer', 'OK'], ['Loading your look', 'OK'], ['Waking the puppets', 'OK'], ['Pod 042', 'ONLINE']],
    hold: 'Synchronising', callout: 'Let’s make Puppet Master feel familiar.', calloutSub: 'You’ll try a few real actions. This guided example does not change your files.'
  };
  const CSS = `
.o55fxb { position: relative; display: grid; gap: 14px; padding: 20px; color: var(--text-primary); font: 14px/1.45 var(--body-font, system-ui, sans-serif); }
.o55fxb-kicker { margin: 0; font: 700 11px/1.2 var(--body-font, system-ui, sans-serif); letter-spacing: .13em; text-transform: uppercase; color: var(--text-muted); }
.o55fxb-title { margin: 0; max-width: 420px; font: 650 26px/1.2 var(--display-font, var(--body-font, system-ui, sans-serif)); }
.o55fxb-short { justify-self: start; padding: 2px 8px; border: 1px solid var(--border); font: 600 12px/1.4 var(--mono-font, monospace); letter-spacing: .14em; }
.o55fxb-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.o55fxb-card { display: grid; gap: 4px; padding: 14px 16px; border: 1px solid var(--border); background: var(--surface); }
.o55fxb-card > span { color: var(--text-muted); font-size: 12.5px; }
.o55fxb-rows { display: grid; gap: 4px; padding-left: 18px; }
.o55fxb-row { padding: 8px 12px; border: 1px solid var(--border); }
.o55fxb-btn { justify-self: start; padding: 8px 14px; border: 1px solid var(--border); background: var(--surface); color: inherit; font: inherit; }
.o55fxb-stage { position: relative; height: 300px; border: 1px solid var(--border); background: var(--surface); }
.o55fxb-pane { position: relative; height: 200px; padding: 22px 26px; border: 1px solid var(--border); background: var(--surface); }
.o55fxb-callout { position: relative; display: grid; gap: 8px; width: 420px; padding: 18px 20px; border: 1px solid var(--border); background: var(--surface); }
.o55fxb-callout h3 { margin: 0; font: 650 18px/1.3 var(--display-font, var(--body-font, system-ui, sans-serif)); }
.o55fxb-callout p { margin: 0; color: var(--text-muted); }
.o55fxb-eyebrow { height: 1px; width: 260px; background: var(--border); }`;
  function mount(host) {
    if (!host) return null;
    if (!document.getElementById('o55fxb-css')) { const st = document.createElement('style'); st.id = 'o55fxb-css'; st.textContent = CSS; document.head.appendChild(st); }
    const D = (k) => O55.util.esc(WORDS[k]);
    const el = document.createElement('div');
    el.className = 'o55fxb';
    el.innerHTML = `<p class="o55fxb-kicker">${D('kicker')}</p><h2 class="o55fxb-title" data-o55fxb="type">${D('title')}</h2>`
      + `<span class="o55fxb-short" data-o55fxb="decode">${D('short')}</span>`
      + '<div class="o55fxb-grid">'
      + `<div class="o55fxb-card" data-o55fxb="slice"><b>${D('slice')}</b><span>${D('sliceSub')}</span></div>`
      + `<div class="o55fxb-card" data-o55fxb="wipe"><b>${D('wipe')}</b><span>${D('wipeSub')}</span></div>`
      + `<div class="o55fxb-card" data-o55fxb="glitch"><b>${D('glitch')}</b><span>${D('glitchSub')}</span></div>`
      + `<div class="o55fxb-card" data-o55fxb="alert"><b>${D('alert')}</b><span>${D('alertSub')}</span></div>`
      + '</div><div class="o55fxb-rows" role="listbox">'
      + `<div class="o55fxb-row" role="option" data-o55fxb="cursor">${D('rowA')}</div><div class="o55fxb-row" role="option" data-o55fxb="cursor2">${D('rowB')}</div>`
      + `<div class="o55fxb-row" role="option" data-o55fxb="brackets">${D('rowC')}</div></div>`
      + `<button type="button" class="o55fxb-btn" data-o55fxb="pod">${D('podButton')}</button>`
      + '<div class="o55fxb-stage" data-o55fxb="stage"></div>'
      + '<div class="o55fxb-pane" data-o55fxb="pane"><div class="o55fxb-eyebrow" data-o55fxb="eyebrow"></div></div>'
      + `<div class="o55fxb-callout" data-o55fxb="callout"><h3>${D('callout')}</h3><p>${D('calloutSub')}</p></div>`;
    host.appendChild(el);
    const at = (k) => el.querySelector(`[data-o55fxb="${k}"]`);
    let log = null;
    const RUN = {
      type: () => FX.type(at('type'), { sound: true }),
      decode: () => FX.decode(at('decode')),
      slice: () => FX.slice(at('slice')),
      wipe: () => FX.wipe(at('wipe')),
      wipeBack: () => FX.wipe(at('wipe'), { dir: 'back' }),
      glitch: () => FX.glitch(at('glitch')),
      alert: () => FX.alert(at('alert')),
      brackets: () => Promise.resolve(!!FX.brackets(at('brackets'), true)),
      cursor: () => Promise.resolve(!!FX.cursor(at('cursor'), true)),
      cursor2: () => Promise.resolve(!!FX.cursor(at('cursor2'), true)),
      pod: () => FX.pod.say(WORDS.podLine, { anchor: at('pod'), lead: 'proposal' }),
      banner: () => FX.banner({ title: WORDS.bannerTitle, sub: WORDS.bannerSub }),
      hang: () => FX.banner({ kicker: WORDS.actKicker, title: WORDS.actTitle, sub: WORDS.actSub, within: at('stage'), hang: true, inset: 0.08, at: 0.36, ms: 1660, sound: false,
        onLand: () => { window.__o55fxbLanded = performance.now(); } }),
      band: () => FX.band(O55.t('nierFx.band.lines.setupStart')),
      bootlog: () => {
        if (log) log.cancel();
        log = FX.bootlog(at('pane'), WORDS.log.map(([text, stamp]) => ({ text, stamp })), { kicker: WORDS.logKicker });
        log.hold(WORDS.hold, { at: 1100 });
        return log.done.then(() => log.close({ to: at('eyebrow') }));
      },
      fold: () => FX.fold(at('callout')).then((line) => (line ? FX.lineTo(line, at('pane')).then(() => FX.slice(at('callout'), { from: line })) : false)),
      hops: () => { const u = document.createElement('i'); u.style.cssText = 'position:fixed;left:120px;top:520px;width:20px;height:26px;z-index:2147482100;background:var(--o55-nier-ink)'; document.body.appendChild(u); return FX.hops(u, { dx: 520, dy: -140 }, { arc: 60 }).then((ok) => { u.remove(); return ok; }); },
      trail: () => { const r = at('pod').getBoundingClientRect(); for (let i = 0; i < 9; i++) O55.motion.after(i * 50, () => FX.trail(r.right + 10 + i * 14, r.top + 6 - i * 3)); return O55.motion.delay(600).then(() => true); }
    };
    const runOne = (name) => (RUN[name] ? RUN[name]() : Promise.resolve(false));
    return {
      el,
      names: Object.keys(RUN),
      run: runOne,
      runAll() { return Promise.all(['type', 'decode', 'slice', 'wipe', 'glitch', 'alert', 'brackets', 'cursor', 'pod'].map(runOne)); },
      dispose() {
        FX.brackets(at('brackets'), false); FX.cursor(at('cursor'), false); FX.cursor(at('cursor2'), false);
        FX.pod.hush(true);
        if (log) log.cancel();
        FX.unfold(at('callout'));
        el.remove();
      }
    };
  }
  window.O55FxBench = { mount };
  FX.demo = mount;
})();
