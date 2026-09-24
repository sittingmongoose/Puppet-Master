/* Chapter 1 — Welcome [welcome]: opening + Pick a look (theme_family / theme_mode). */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);

  def('welcome', {
    chapter: 'welcome', stage: 'welcome',
    scene: () => ({ id: 'hero', beat: 'intro' }),
    eyebrow: () => T('welcome.eyebrow'),
    title: () => T('welcome.title'),
    lead: () => T('welcome.lead'),
    body(S) {
      let out = '';
      if (O55.S.resumed) out += `<div class="o55-banner" data-key="resume">${C.small('history', 18)}<span>${U.esc(T('welcome.resumed'))}</span>${C.link(T('welcome.startOver'), 'startOver')}</div>`;
      const e = S.env, n = e.here.projects.length, ai = Object.entries(e.here.providers).filter(([, v]) => v && v.signedIn).map(([k]) => O55.fixtures.provider(k).name);
      if (n || ai.length) out += `<div class="o55-banner o55-banner-soft" data-key="back">${C.small('spark', 18)}<span>${U.esc(T('welcome.returning', { projects: n ? T(n === 1 ? 'welcome.oneProject' : 'welcome.nProjects', { n }) : '', ai: ai.length ? ai.join(', ') : '', and: n && ai.length ? T('welcome.and') : '' }).replace(/\s+/g, ' ').replace(' .', '.'))}</span></div>`;
      out += `<ul class="o55-promise" data-key="promise">${['describe', 'plan', 'work'].map((k, i) => `<li style="--ci:${i}">${C.small(['power', 'check', 'stack'][i], 16)}<span>${U.esc(T('welcome.promise.' + k))}</span></li>`).join('')}</ul>`;
      return out;
    },
    foot: () => ({ back: false, secondary: [{ label: T('welcome.skip'), do: 'skipAll', cls: 'o55-ghost' }], primary: { label: T('welcome.start'), do: 'start' } }),
    do: {
      start(S) { O55.ui.go('look'); },
      skipAll(S) { O55.ui.close('skip'); },
      startOver(S) { O55.ui.open({ fresh: true }); }
    }
  });

  const FAMS = ['basic', 'friendly', 'glass', 'retro'];
  function ack(el, sel) {
    const group = el.parentElement;
    group.querySelectorAll(':scope > ' + sel).forEach((n) => { const on = n === el; n.classList.toggle('o55-on', on); n.setAttribute('aria-checked', String(on)); });
  }
  def('look', {
    chapter: 'welcome', stage: 'welcome', charmSlot: 'look',
    scene: () => ({ id: 'hero', beat: 'look' }),
    eyebrow: () => T('look.eyebrow'),
    title: () => T('look.title'),
    lead: () => T('look.lead'),
    body(S) {
      const th = O55.theme();
      const tiles = FAMS.map((f, i) => {
        const on = th.family === f;
        return `<button type="button" class="o55-tile${on ? ' o55-on' : ''}" role="radio" aria-checked="${on}" data-o55-do="pickFamily" data-o55-sound="self" data-arg="${f}" data-theme="${f}-${th.mode}" data-key="tile-${f}" data-pm-hover-exempt="true" style="--ci:${i}">`
          + `<span class="o55-tileart o55-scene-host" data-family="${f}" data-tile="${f}" aria-hidden="true" data-morph-skip></span>`
          + `<span class="o55-tilename">${U.esc(T('look.families.' + f + '.name'))}</span><span class="o55-tilesub">${U.esc(T('look.families.' + f + '.sub'))}</span>`
          + `<span class="o55-check" aria-hidden="true"></span></button>`;
      }).join('');
      /* Light/Dark sits above the tiles; a returning person reads that their current look is kept unless they pick
         another (it is already the selected tile) */
      const note = S.env.here.projects.length ? `<span class="o55-hintline o55-keep">${C.small('check', 13)}${U.esc(T('look.keep'))}</span>` : `<span class="o55-hintline">${U.esc(T('look.hint'))}</span>`;
      return `<div class="o55-lookmode" data-key="mode">${C.segmented({ do: 'pickMode', value: th.mode, label: T('look.modeLabel'), options: [{ v: 'light', label: T('look.light'), glyph: 'spark' }, { v: 'dark', label: T('look.dark'), glyph: 'history' }] })}${note}</div>`
        + `<div class="o55-tiles" role="radiogroup" aria-label="${U.esc(T('look.title'))}">${tiles}</div>`;
    },
    mounted(S, layer, first) {
      /* each tile is a small living scene drawn with that family's own tokens */
      layer.querySelectorAll('.o55-tileart').forEach((host) => {
        const f = host.getAttribute('data-tile'), mode = O55.theme().mode;
        const key = f + '-' + mode;
        if (host.getAttribute('data-look') === key) return;
        host.setAttribute('data-look', key);
        const tile = host.closest('.o55-tile'); tile.setAttribute('data-theme', key);
        host.innerHTML = '';
        O55.art.mount(host, 'tile', { family: f, mode, beat: 'default', tok: O55.art.tokens(tile), params: {}, instance: 'tile', band: true });
      });
    },
    foot: () => ({ primary: { label: T('chrome.continue'), do: 'next' } }),
    do: {
      /* The click is acknowledged in the same frame (selection + sound) before the whole app re-themes, which can
         take a few hundred milliseconds on a large page; the reveal then plays from the tile. */
      pickFamily(S, f, el) {
        ack(el, '.o55-tile');
        O55.sound.play('select', { family: f });
        O55.ui.charm(el, T('look.families.' + f + '.name'), 'spark');
        O55.ui.applyLook(f, O55.theme().mode, el);
      },
      pickMode(S, m, el) { ack(el, 'button'); O55.ui.applyLook(O55.theme().family, m, el); },
      next(S) { O55.ui.go('where'); }
    }
  });
})();
