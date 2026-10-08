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
  /* NieR Mode under the four looks: a checkbox over whichever look is picked (never a fifth tile, so it sits outside
     their radiogroup), a NieR scene of its own, and Adjust NieR look (enabled on or off: the editor shows Turn on). In
     onboarding it is a preview kept with the look (O55.nierLook). */
  function nierRow(th) {
    if (!O55.nierLook || !window.PM_NIER) return '';
    const on = O55.nierLook.state().on, name = T('look.families.' + th.chosen + '.name'), sub = on ? T('look.nier.subOn', { name }) : T('look.nier.sub');
    return `<div class="o55-nierlook" data-key="nier" data-on="${on}">`
      + `<button type="button" class="o55-niercheck${on ? ' o55-on' : ''}" role="checkbox" aria-checked="${on}" aria-labelledby="o55-niername" aria-describedby="o55-niersub" title="${U.esc(sub)}" data-o55-do="pickNier" data-o55-sound="self" data-o55-nier-check data-key="nier-check" data-pm-hover-exempt="true">`
      + `<span class="o55-nierthumb o55-scene-host" data-nier-thumb aria-hidden="true" data-morph-skip></span>`
      + `<span class="o55-niertext"><span class="o55-niertitle"><span class="o55-nierbox" aria-hidden="true"></span><span class="o55-niername" id="o55-niername">${U.esc(T('look.nier.label'))}</span>`
      + `<span class="o55-tag o55-niertag">${U.esc(T('look.nier.tag'))}</span></span>`
      + `<span class="o55-niersub" id="o55-niersub">${U.esc(sub)}</span></span></button>`
      + `<button type="button" class="o55-btn o55-secondary o55-small o55-nieradjust" data-o55-do="adjustNier" data-o55-sound="self" data-key="nier-adjust" data-pm-hover-exempt="true">${O55.nierLook.icon()}<span>${U.esc(T('look.nier.adjust'))}</span></button></div>`;
  }
  let nierSub = null;
  function ack(el, sel) {
    const group = el.parentElement;
    group.querySelectorAll(':scope > ' + sel).forEach((n) => { const on = n === el; n.classList.toggle('o55-on', on); n.setAttribute('aria-checked', String(on)); });
  }
  def('look', {
    chapter: 'welcome', stage: 'welcome', charmSlot: 'look',
    scene: () => ({ id: 'hero', beat: 'look' }),
    eyebrow: () => T('look.eyebrow'),
    title: () => T('look.title'),
    /* the note about Light / Dark (or, for a returning person, that their look is kept) ends the lead, on its short
       second line, so the mode line has room for NieR Mode beside Light / Dark (review W5) */
    lead: (S) => T('look.lead') + ' ' + T(S && S.env && S.env.here.projects.length ? 'look.keep' : 'look.modeHint'),
    body(S) {
      const th = O55.theme();
      const tiles = FAMS.map((f, i) => {
        const on = th.chosen === f;
        return `<button type="button" class="o55-tile${on ? ' o55-on' : ''}" role="radio" aria-checked="${on}" data-o55-do="pickFamily" data-o55-sound="self" data-arg="${f}" data-theme="${f}-${th.mode}" data-key="tile-${f}" data-pm-hover-exempt="true" style="--ci:${i}">`
          + `<span class="o55-tileart o55-scene-host" data-family="${f}" data-tile="${f}" aria-hidden="true" data-morph-skip></span>`
          + `<span class="o55-tilename">${U.esc(T('look.families.' + f + '.name'))}</span><span class="o55-tilesub">${U.esc(T('look.families.' + f + '.sub'))}</span>`
          + `<span class="o55-check" aria-hidden="true"></span></button>`;
      }).join('');
      /* Light / Dark sits above the tiles. NieR Mode follows the tiles in reading order; on a wide window it is drawn
         as a compact card on Light / Dark's line (13-nier-look.css), so the checkbox and Adjust are in the first view
         with the four looks; the narrow window keeps it as a row under them */
      return `<div class="o55-lookgrid" data-key="lookgrid"><div class="o55-lookmode" data-key="mode">${C.segmented({ do: 'pickMode', value: th.mode, label: T('look.modeLabel'), options: [{ v: 'light', label: T('look.light'), glyph: 'spark' }, { v: 'dark', label: T('look.dark'), glyph: 'history' }] })}</div>`
        + `<div class="o55-tiles" role="radiogroup" aria-label="${U.esc(T('look.title'))}" data-key="tiles">${tiles}</div>` + nierRow(th) + '</div>';
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
      /* the NieR row's scene is drawn in NieR's own tokens whether NieR Mode is on or off: while off it previews them
         (data-o55-nier-preview over Basic, the look NieR Mode paints over); while on it takes the painted ones */
      /* While NieR Mode is off the thumbnail is a still picture of it: drawn whole, its ambient loops and the rig's
         idle sway held (data-o55-ambient="off" on its host, which 30-art.css and the rig read; ART's still mount, when
         it has one, is asked for too), so the look screen keeps four live scenes, not five. Once NieR Mode is painted it
         lives like the tiles. */
      const th = O55.theme(), thumb = layer.querySelector('[data-nier-thumb]');
      if (thumb) {
        const key = 'nier-' + th.mode + (th.nier ? '-on' : '');
        if (thumb.getAttribute('data-look') !== key) {
          thumb.setAttribute('data-look', key); thumb.setAttribute('data-o55-nier-preview', th.mode);
          if (th.nier) thumb.removeAttribute('data-theme'); else thumb.setAttribute('data-theme', 'basic-' + th.mode);
          if (th.nier) thumb.removeAttribute('data-o55-ambient'); else thumb.setAttribute('data-o55-ambient', 'off');
          thumb.innerHTML = '';
          O55.art.mount(thumb, 'tile', { family: 'basic', mode: th.mode, beat: 'default', tok: O55.art.tokens(thumb), params: {}, instance: 'nier', band: true, still: !th.nier });
        }
      }
      /* a look picked under NieR Mode changes the line that names it: NieR resolves it from scrambled letters */
      const sub = layer.querySelector('.o55-niersub'), text = sub ? sub.textContent : null;
      if (sub && !first && nierSub !== null && text !== nierSub && th.nier && O55.nierFx && O55.nierFx.decode) O55.nierFx.decode(sub);
      nierSub = text;
    },
    foot: () => ({ primary: { label: T('chrome.continue'), do: 'next' } }),
    do: {
      /* The click is acknowledged in the same frame (selection + sound) before the whole app re-themes, which can
         take a few hundred milliseconds on a large page; the reveal then plays from the tile. */
      pickFamily(S, f, el) {
        ack(el, '.o55-tile');
        /* in the picked family's own voice; under NieR Mode the painted look (and its kit) stays NieR */
        if (O55.theme().nier) O55.sound.play('select');
        else O55.sound.play('select', { family: f });
        O55.ui.charm(el, T('look.families.' + f + '.name'), 'spark');
        O55.ui.applyLook(f, O55.theme().mode, el);
      },
      pickMode(S, m, el) { ack(el, 'button'); O55.ui.applyLook(O55.theme().chosen, m, el); },
      next(S) { O55.ui.go('where'); },
      pickNier(S, arg, el) { O55.nierLook.toggle('look', el); },
      adjustNier(S, arg, el) { O55.nierLook.adjust(el); }
    }
  });
})();
