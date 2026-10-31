/* Chapter 1 — Welcome [welcome]: opening + Pick a look (theme_family / theme_mode). */
(function () {
  'use strict';
  const O55 = window.O55, C = O55.c, U = O55.util, T = (k, v) => O55.t(k, v), def = (id, d) => O55.screens.define(id, d);

  def('welcome', {
    chapter: 'welcome', stage: 'welcome',
    /* (NieR's cold open draws the troupe asleep on slack strings until the boot log wakes it: O55.nierWindow) */
    scene: () => ({ id: 'hero', beat: O55.nierWindow && O55.nierWindow.asleep && O55.nierWindow.asleep() ? 'asleep' : 'intro' }),
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

  const FAMS = O55.LOOKS || ['basic', 'friendly', 'glass', 'retro', 'nier'];
  /* NieR is the fifth look (Q22, Jared 2026-10-30: "make NieR Mode a new theme rather than an override"): five equal
     tiles, three over two (QA2 review M2: NieR's short strip under four big tiles read as tacked on, and the footer cut
     it). While NieR is the chosen look, Adjust NieR sits at the end of Light / Dark's line, with its ?, for NieR's own
     options (its parts and background). In onboarding the pick and the options are a preview kept with the look
     (O55.nierLook). */
  function adjustNier(th) {
    if (th.chosen !== 'nier' || !O55.nierLook || !window.PM_NIER) return '';
    return `<button type="button" class="o55-btn o55-secondary o55-small o55-nieradjust" data-o55-do="adjustNier" data-o55-sound="self" data-key="nier-adjust"${O55.tips.described('adjustNier')} data-pm-hover-exempt="true">${O55.nierLook.icon()}<span>${U.esc(T('look.nier.adjust'))}</span></button>${O55.tips.q('adjustNier', { cls: 'o55-tipq-adjust' })}`;
  }
  /* The troupe in the wings (hero spec H6): hovering or focusing the NieR row, its thumbnail's control bar dips, the
     three units hop once and sweep their visors (O55.art.peek, at most once a second), and a mono kicker types
     across the thumbnail's top. All of it stays inside the thumbnail, is silent, and is skipped under Reduced Motion. */
  const peeking = new WeakSet();
  function wings(row) {
    if (!row || peeking.has(row)) return;
    peeking.add(row);
    const go = (e) => {
      if (e.type === 'pointerenter' && e.pointerType === 'touch') return;
      if (O55.motion.reduced() || (O55.nierLook && O55.nierLook.busy && O55.nierLook.busy())) return;
      const thumb = row.querySelector('[data-nier-thumb]');
      if (!thumb || !O55.art.peek || !O55.art.peek(thumb)) return;
      let k = thumb.querySelector(':scope > .o55-nierkick');
      if (!k) { k = document.createElement('span'); k.className = 'o55-nierkick'; k.setAttribute('aria-hidden', 'true'); thumb.appendChild(k); }
      k.innerHTML = `<i></i><i></i><i></i><span>${U.esc(T('look.nier.label'))}</span>`;
      k.classList.remove('o55-nierkick-on'); void k.offsetWidth; k.classList.add('o55-nierkick-on');
    };
    row.addEventListener('pointerenter', go);
    row.addEventListener('focusin', (e) => { if (!row.contains(e.relatedTarget)) go(e); });
  }
  function ack(el, sel) {
    /* (a tile sits in its option beside its ?, so its siblings are found through the radiogroup) */
    const group = el.closest('[role="radiogroup"]') || el.parentElement;
    group.querySelectorAll(sel).forEach((n) => { const on = n === el; n.classList.toggle('o55-on', on); n.setAttribute('aria-checked', String(on)); });
  }
  def('look', {
    chapter: 'welcome', stage: 'welcome', charmSlot: 'look',
    scene: () => ({ id: 'hero', beat: 'look' }),
    eyebrow: () => T('look.eyebrow'),
    title: () => T('look.title'),
    /* the note about Light / Dark (or, for a returning person, that their look is kept) ends the lead, on its short
       second line (review W5) */
    lead: (S) => T('look.lead') + ' ' + T(S && S.env && S.env.here.projects.length ? 'look.keep' : 'look.modeHint'),
    body(S) {
      const th = O55.theme();
      const tiles = FAMS.map((f, i) => {
        const on = th.chosen === f, nier = f === 'nier';
        /* NieR's scene is drawn in its own tokens: its preview scope over Basic (the look it paints over) */
        const look = nier ? `data-theme="basic-${th.mode}" data-o55-nier-preview="${th.mode}"` : `data-theme="${f}-${th.mode}"`;
        return `<button type="button" class="o55-tile${nier ? ' o55-tile-nier' : ''}${on ? ' o55-on' : ''}" role="radio" aria-checked="${on}" data-o55-do="pickFamily" data-o55-sound="self" data-arg="${f}" ${look} data-key="tile-${f}"${O55.tips.described('pickFamily:' + f)} data-pm-hover-exempt="true" style="--ci:${i}">`
          + `<span class="o55-tileart o55-scene-host" data-family="${nier ? 'basic' : f}" data-tile="${f}"${nier ? ' data-nier-thumb' : ''} aria-hidden="true" data-morph-skip></span>`
          + `<span class="o55-tilename">${U.esc(T('look.families.' + f + '.name'))}</span><span class="o55-tilesub">${U.esc(T('look.families.' + f + '.sub'))}</span>`
          + `<span class="o55-check" aria-hidden="true"></span></button>`;
      }).map((html, i) => O55.tips.opt('pickFamily:' + FAMS[i], html, 'o55-opt-tile', 'div', { note: false })).join('');
      /* Light / Dark (and, while NieR is the look, Adjust NieR at the line's end) above the five tiles, which fit the
         first view at every window size (10-window.css, the look screen's tile sizes) */
      const adjust = adjustNier(th);
      return `<div class="o55-lookgrid" data-key="lookgrid"><div class="o55-lookmode" data-key="mode">${C.segmented({ do: 'pickMode', value: th.mode, label: T('look.modeLabel'), options: [{ v: 'light', label: T('look.light'), glyph: 'spark' }, { v: 'dark', label: T('look.dark'), glyph: 'history' }] })}${adjust ? `<span class="o55-lookmode-adjust">${adjust}</span>` : ''}</div>`
        + `<div class="o55-tiles" role="radiogroup" aria-label="${U.esc(T('look.title'))}" data-key="tiles">${tiles}</div>`
        + FAMS.map((f) => O55.tips.explainer('pickFamily:' + f)).join('') + (th.chosen === 'nier' ? O55.tips.explainer('adjustNier') : '') + '</div>';
    },
    mounted(S, layer, first) {
      /* each tile is a small living scene drawn with that family's own tokens */
      layer.querySelectorAll('.o55-tileart:not([data-nier-thumb])').forEach((host) => {
        const f = host.getAttribute('data-tile'), mode = O55.theme().mode;
        const key = f + '-' + mode;
        if (host.getAttribute('data-look') === key) return;
        host.setAttribute('data-look', key);
        const tile = host.closest('.o55-tile'); tile.setAttribute('data-theme', key);
        host.innerHTML = '';
        O55.art.mount(host, 'tile', { family: f, mode, beat: 'default', tok: O55.art.tokens(tile), params: {}, instance: 'tile', band: true });
      });
      /* NieR's tile scene is drawn in NieR's own tokens whichever look is painted: in another look it previews them
         (data-o55-nier-preview over Basic, the tokens NieR paints over); in NieR it takes the painted ones */
      /* While another look is painted the NieR scene is a still picture: drawn whole, its ambient loops and the rig's
         idle sway held (data-o55-ambient="off" on its host, which 30-art.css and the rig read; ART's still mount, when
         it has one, is asked for too), so the look screen keeps four live scenes, not five. Once NieR is painted it
         lives like the tiles. */
      const th = O55.theme(), thumb = layer.querySelector('[data-nier-thumb]');
      if (thumb) {
        const key = 'nier-' + th.mode + (th.nier ? '-on' : '');
        if (thumb.getAttribute('data-look') !== key) {
          thumb.setAttribute('data-look', key); thumb.setAttribute('data-o55-nier-preview', th.mode);
          if (th.nier) thumb.removeAttribute('data-theme'); else thumb.setAttribute('data-theme', 'basic-' + th.mode);
          const tile = thumb.closest('.o55-tile'); if (tile) { tile.setAttribute('data-o55-nier-preview', th.mode); if (th.nier) tile.removeAttribute('data-theme'); else tile.setAttribute('data-theme', 'basic-' + th.mode); }
          if (th.nier) thumb.removeAttribute('data-o55-ambient'); else thumb.setAttribute('data-o55-ambient', 'off');
          thumb.innerHTML = '';
          O55.art.mount(thumb, 'tile', { family: 'basic', mode: th.mode, beat: 'default', tok: O55.art.tokens(thumb), params: {}, instance: 'nier', band: true, still: !th.nier });
        }
      }
      const nierTile = layer.querySelector('.o55-tile-nier');
      wings(nierTile ? nierTile.closest('.o55-opt-tile') : null);
    },
    foot: () => ({ primary: { label: T('chrome.continue'), do: 'next' } }),
    do: {
      /* The click is acknowledged in the same frame (selection + sound) before the whole app re-themes, which can
         take a few hundred milliseconds on a large page; the reveal then plays from the tile. */
      pickFamily(S, f, el) {
        ack(el, '.o55-tile');
        /* in the picked look's own voice (NieR's kit for NieR) */
        O55.sound.play('select', { family: f });
        O55.ui.charm(el, T('look.families.' + f + '.name'), 'spark');
        O55.ui.applyLook(f, O55.theme().mode, el);
      },
      pickMode(S, m, el) { ack(el, 'button'); O55.ui.applyLook(O55.theme().chosen, m, el); },
      next(S) { O55.ui.go('where'); },
      /* (an older key: NieR is a look now) */
      pickNier(S, arg, el) { O55.ui.applyLook('nier', O55.theme().mode, el); },
      adjustNier(S, arg, el) { O55.nierLook.adjust(el); }
    }
  });
})();
