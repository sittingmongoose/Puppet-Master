/* Settings managers, rethought (Fable 5.2): Look & feel.
   What was wrong (audit A4): the look is a dropdown and a title-bar menu that show nothing before you pick; the accent
   is six circles with no names and nothing that shows what an accent colours; a wallpaper sits behind the panels, which
   Settings covers, so you cannot see the one you picked. The owner's rule for every look manager: the example must stay
   in view and must show what is being changed.
   This page: every look is a card drawn in that look's own colours, corners and font; the choices sit beside an example
   window that stays in view and redraws with each pick; a line under it says what changed and where to look.
   The settings are PMConcept7's own (theme, light or dark, accent, wallpaper, app font); nothing is stored here. */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const D = W.document;
  const ui = SMX.ui, h = SMX.h;
  const kit = () => W.PM51;
  const val = (id) => SMX.val(id);
  const lab = (id) => { const v = val(id); try { return String(kit().valueLabel(id, v) || v || ''); } catch (e) { return String(v || ''); } };

  const THEME = 'general.visual.theme', MODE = 'general.visual.theme-mode', ACCENT = 'general.visual.accent-color', WALL = 'general.visual.wallpaper', FONT = 'general.visual.app-font';
  const LOOKS = [
    { id: 'Basic', key: 'basic', line: 'Clean and quiet. A good place to start.' },
    { id: 'Friendly', key: 'friendly', line: 'Round corners, soft colours, a warmer font.' },
    { id: 'Retro', key: 'retro', line: 'Square edges and a typewriter font, like an old computer.' },
    { id: 'Glass', key: 'glass', line: 'See-through panels, so your wallpaper shows.' },
    { id: 'NieR', key: 'nier', line: 'Ink on parchment, with its own sounds and motion.' }
  ];
  const MODES = [['Light', 'Light'], ['Dark', 'Dark'], ['Auto', 'Match my computer']];
  const ACCENTS = [['Theme', 'The look’s own', ''], ['Violet', 'Violet', '#8b5cf6'], ['Cyan', 'Cyan', '#39bfe6'], ['Rose', 'Rose', '#e96a9d'], ['Amber', 'Amber', '#e9aa52'], ['Emerald', 'Emerald', '#43c78b']];

  /* what is chosen now */
  const now = () => {
    const theme = String(val(THEME) || 'Basic');
    const look = LOOKS.find((l) => theme.toLowerCase().startsWith(l.key)) || LOOKS[0];
    const shown = /light$/.test(D.documentElement.getAttribute('data-theme') || '') ? 'light' : 'dark';   // what "Match my computer" resolved to
    return { look, mode: String(val(MODE) || 'Dark'), shown, accent: String(val(ACCENT) || 'Theme'), wall: String(val(WALL) || 'look'), wallName: lab(WALL), font: lab(FONT) };
  };

  /* The cards and the light-or-dark choice set the real settings through PMConcept7's own two rows, which sit unseen
     on the page: a pick puts the value into that row's control and lets it report the change itself. (The wallpaper
     gallery also looks for the Theme row before it draws.) */
  const rowOnly = (id) => { const t = D.createElement('div'); t.innerHTML = ui.settings([id], {}); const list = t.querySelector('.setting-list'); return list ? list.outerHTML : ''; };
  SMX.act('look-pick', (el) => {
    const id = el.getAttribute('data-id'), v = el.getAttribute('data-value');
    const sel = SMX.host().querySelector(`.smx-lk-proxy select[data-setting="${W.CSS.escape(id)}"]`);
    if (!sel || sel.value === v) return;
    sel.value = v; sel.dispatchEvent(new W.Event('change', { bubbles: true }));
  });

  /* ------------------------------------------------------------------ the example: a small window on the wallpaper */
  /* the print PMConcept7 is showing now: the chosen wallpaper, or the look's own (Ribbons in Glass, the scene in NieR) */
  /* The print is a large image, so it goes into one style rule that changes only when the wallpaper does, not into
     the example's own markup, which is redrawn on every pick. */
  let wallKey = null;
  const syncWall = (c) => {
    let id = '', url = '';
    try { const P = W.PM_WALLPAPERS; id = P.shown() || ''; url = id ? (P.sourceUrl(id) || '') : ''; } catch (e) { id = ''; url = ''; }
    const key = `${id}|${c.shown}|${url.length}`;
    if (key === wallKey) return;
    wallKey = key;
    let st = D.getElementById('smx-lk-wall');
    if (!st) { st = D.createElement('style'); st.id = 'smx-lk-wall'; D.head.appendChild(st); }
    st.textContent = url ? `#smx-root .smx-lk-ex-wall { background-image: url("${url.replace(/"/g, '%22')}"); }` : '';
  };
  let last = null, said = '';
  const sayWhat = (c) => {
    const sig = { look: c.look.id, mode: c.mode, accent: c.accent, wall: c.wall, font: c.font };
    if (last) {
      if (sig.look !== last.look) said = `<b>${h(c.look.id)}</b> look. Everything follows it: the colours, the corners and the font.`;
      else if (sig.mode !== last.mode) said = `<b>${h((MODES.find((m) => m[0] === c.mode) || [0, c.mode])[1])}</b>. The same look, in its ${c.shown} version.`;
      else if (sig.accent !== last.accent) said = `Accent: <b>${h((ACCENTS.find((a) => a[0] === c.accent) || [0, c.accent])[1])}</b>. Look at Send, the chosen row on the left, the bar and the link.`;
      else if (sig.wall !== last.wall) said = `Wallpaper: <b>${h(c.wall === 'look' ? 'the look’s own' : c.wallName)}</b>. It sits behind every panel${c.look.key === 'glass' ? '; Glass lets it show through.' : '. The Glass look shows the most of it.'}`;
      else if (sig.font !== last.font) said = `App font: <b>${h(c.font)}</b>. Read the two messages in the example.`;
    }
    last = sig;
    return said || 'This is how Puppet Master looks with your choices. Change one and watch it here.';
  };
  const example = (c) => {
    syncWall(c);
    return `
    <figure class="smx-lk-ex" aria-label="An example of how Puppet Master looks with these choices">
      <div class="smx-lk-ex-stage">
        <div class="smx-lk-ex-wall" aria-hidden="true"></div>
        <div class="smx-lk-ex-win" aria-hidden="true">
          <div class="smx-lk-ex-bar"><i></i><b>tastebook</b><span class="is-on">Chat</span><span>Files</span><span>Plan</span></div>
          <div class="smx-lk-ex-body">
            <div class="smx-lk-ex-rail"><span>Recipes</span><span class="is-on">Dark mode</span><span>Sign-in</span></div>
            <div class="smx-lk-ex-main">
              <p class="smx-lk-ex-you">Add a dark mode to the recipe page</p>
              <p class="smx-lk-ex-ai">Done. I changed 3 files and the tests pass. <u>See the changes</u></p>
              <div class="smx-lk-ex-prog"><i></i></div>
              <div class="smx-lk-ex-row"><span class="smx-lk-ex-btn is-main">Send</span><span class="smx-lk-ex-btn is-focus">Cancel</span><span class="smx-lk-ex-switch"><i></i></span></div>
            </div>
          </div>
        </div>
      </div>
      <figcaption class="smx-lk-ex-cap"><b>${h(c.look.id)}</b> · ${c.mode === 'Auto' ? `matching your computer (${c.shown} now)` : h(c.mode.toLowerCase())} · ${c.accent === 'Theme' || c.look.key === 'nier' ? 'the look’s own accent' : h(c.accent) + ' accent'} · ${c.wall === 'look' ? 'the look’s own wallpaper' : h(c.wallName)}</figcaption>
      <p class="smx-lk-said" aria-live="polite"><i aria-hidden="true"></i><span>${sayWhat(c)}</span></p>
    </figure>`;
  };

  /* ------------------------------------------------------------------ the choices */
  const mini = (l, c) => {
    if (l.key === 'nier') return `<span class="smx-lk-mini is-nier" data-smx-shown="${c.shown}"><span class="smx-lk-mini-win"><i></i><b>Aa</b><em></em></span></span>`;
    return `<span class="smx-lk-mini" data-theme="${l.key}-${c.shown}"><span class="smx-lk-mini-win"><i></i><b>Aa</b><em></em></span></span>`;
  };
  const lookCards = (c) => `<div class="smx-lk-cards" role="radiogroup" aria-label="Look">${LOOKS.map((l) => `<button type="button" class="smx-lk-card${l.id === c.look.id ? ' is-on' : ''}" role="radio" aria-checked="${l.id === c.look.id}" title="${h(l.line)}" data-smx-do="look-pick" data-id="${THEME}" data-value="${h(l.id)}" data-smx-key="look-${l.key}">${mini(l, c)}<span class="smx-lk-card-name">${h(l.id)}${l.id === c.look.id ? SMX.icon('check') : ''}</span><span class="smx-lk-card-line">${h(l.line)}</span></button>`).join('')}</div><p class="smx-lk-chosen"><b>${h(c.look.id)}.</b> ${h(c.look.line)}</p>`;
  const modeSeg = (c) => `<div class="smx-lk-seg" role="radiogroup" aria-label="Light or dark">${MODES.map(([v, name]) => `<button type="button" role="radio" aria-checked="${c.mode === v}" class="${c.mode === v ? 'is-on' : ''}" data-smx-do="look-pick" data-id="${MODE}" data-value="${v}" data-smx-key="mode-${v}">${SMX.icon(v === 'Light' ? 'sun' : v === 'Dark' ? 'moon' : 'laptop')}<span>${h(name)}</span></button>`).join('')}</div>`;
  const accents = (c) => (c.look.key === 'nier'
    ? ui.note('The NieR look decides its own accent. Pick another look to choose one.')
    : `<div class="smx-lk-sws" role="radiogroup" aria-label="Accent colour">${ACCENTS.map(([v, name, hex]) => `<button type="button" class="smx-lk-sw${c.accent === v ? ' is-on' : ''}" role="radio" aria-checked="${c.accent === v}" data-action="set-setting" data-setting="${ACCENT}" data-value="${v}" data-smx-key="accent-${v}"><i style="--sw:${hex || 'var(--o55-theme-accent, var(--accent-primary))'}"></i><span>${h(name)}</span></button>`).join('')}</div>`);
  const choice = (title, help, body) => `<section class="panel-card pm51-section smx-lk-choice"><div class="pm51-section-head"><div class="pm51-section-copy"><h3 class="pm51-section-title">${h(title)}</h3>${help ? `<p class="pm51-section-help">${h(help)}</p>` : ''}</div></div><div class="smx-lk-choice-body">${body}</div></section>`;

  const isLook = (key) => () => now().look.key === key;
  SMX.extend('look', {
    cls: 'is-wide smx-look',
    purpose: 'Pick a look, light or dark, an accent colour and a wallpaper. The example beside the choices shows each one as you pick it.',
    /* each choice is a block of its own, so picking one redraws the example and leaves the wallpaper gallery alone */
    lead: (ctx) => {
      const c = now();
      return [
        { key: 'example', html: example(c) },
        { key: 'look', html: choice('Look', 'Each card is drawn in that look’s own colours, corners and font.', lookCards(c)) },
        { key: 'mode', html: choice('Light or dark', 'Every look has both.', modeSeg(c)) },
        { key: 'accent', html: choice('Accent colour', 'The colour of the thing you have chosen, the main button, progress and links.', accents(c)) },
        { key: 'proxy', html: `<div class="smx-lk-proxy" hidden>${rowOnly(THEME)}${rowOnly(MODE)}</div>` }
      ];
    },
    sections: [
      { key: 'wall', title: 'Wallpaper', help: 'What sits behind the panels. Its light or dark print follows the look.', ids: [WALL] },
      { key: 'font', title: 'App font', help: 'The typeface of everything except code.', ids: [FONT] },
      { key: 'own-glass', title: 'Only for the Glass look', help: 'How see-through the panels are.', ids: ['general.visual.glass-transparency'], when: isLook('glass') },
      { key: 'own-retro', title: 'Only for the Retro look', help: 'The old-screen effects.', ids: ['general.visual.retro-effects'], when: isLook('retro') },
      { key: 'own-nier', title: 'Only for the NieR look', help: 'Each part of the NieR look can be taken out, and it has backgrounds of its own.', ids: ['general.visual.nier-parts', 'general.visual.nier-background'], when: isLook('nier') },
      { key: 'pip', title: 'Pip, the little helper', help: 'Where Pip appears, the faces it makes and whether it makes a sound.', ids: ['general.visual.pip-parts'] }
    ],
    covers: { [THEME]: 'The five look cards.', [MODE]: 'Light, Dark or Match my computer, under the look cards.', [ACCENT]: 'The named accent swatches.' },
    changes: [
      { was: 'The look is a dropdown of five names (and a menu in the title bar). Neither shows what a look is before you pick it, and picking closes the menu.', now: 'Five cards, each drawn in its look’s own colours, corners and font, in the light or dark version you are using.' },
      { was: 'Accent colour is six circles with no names, and nothing on the page shows what an accent colours. Wallpaper sits behind the panels, which Settings covers, so the one you picked cannot be seen while you pick.', now: 'An example window stays beside the choices: a chat, a chosen row, a main button, a progress bar and a link, on the wallpaper. It redraws with every pick, and a line under it says what changed and where to look. The swatches carry their names.' },
      { was: 'Theme, Light or dark, Accent and App font are in “Theme & colors”; Wallpaper is in “Size & readability”; Glass, Retro and NieR extras show as rows that are greyed until their look is chosen.', now: 'One page. The extras of a look appear only while that look is chosen.' }
    ]
  });

  /* ------------------------------------------------------------------ Editor look and Terminal look: the page leads to Customize */
  const own = (text) => (/follow|look/i.test(text) ? 'the look’s own' : text);
  const customize = (o) => ui.summary({ icon: o.icon, lines: [o.line, 'Customize shows every choice on a live example that stays beside the options, and says what each change did.'], side: ui.btn({ label: o.button, icon: 'sliders', action: o.action, primary: true }) });
  SMX.extend('look/editor', {
    lead: (ctx) => [{ key: 'open', html: customize({ icon: 'code', button: 'Customize the editor', action: 'pm51-o55-editor-customize',
      line: `The editor uses ${ui.b(own(lab('code.editing.color-scheme')))} colours and ${ui.b(own(lab('code.editing.font-family')))} at ${ui.b(lab('code.editing.font-size'))}.` }) }],
    changes: [
      { was: 'Editor appearance opens with its example at the top of one scroll 6,166 px long in a 747 px window (eight windows of options). One click on an option and the example is 3,166 px above; a small copy (389 × 176) then floats over the option tabs.', now: 'The example stays beside the options at full size for as long as the dialog is open. The options are six tabs (Colors, Text, Caret, Lines & guides, Motion & effects, Behavior) instead of one scroll; “Everything” still shows them as one list.' },
      { was: 'Many choices change nothing the sample can show at rest: ligatures at 13 px, indent guides on three levels, rulers past the edge of the sample, wrapping, sticky scroll, smooth scrolling, an editor that fades when you leave it.', now: 'Each change makes the example prove it: the caret travels when you change the caret, text is typed when you change the font, and choices the sample cannot show get a close-up drawn for that one choice. A line under the example names what you changed.' },
      { was: 'The page lists 13 editor look rows and hides 25 more behind “More options”; the same choices are also in Customize under different labels.', now: 'The page leads with Customize. The rows stay, as “the basics” and a full list, for people who prefer a list.' }
    ]
  });
  SMX.extend('look/terminal', {
    lead: (ctx) => [{ key: 'open', html: customize({ icon: 'terminal', button: 'Customize the terminal', action: 'pm51-o55-terminal-customize',
      line: `The terminal uses ${ui.b(own(lab('code.terminal.theme')))} colours and ${ui.b(own(lab('code.terminal.font-family')))} at ${ui.b(lab('code.terminal.font-size'))}.` }) }],
    changes: [
      { was: 'Terminal appearance has the same shape as the editor’s: an example at the top of 5,049 px of options, and a small floating copy that shows about three lines of it.', now: 'The example stays beside the options, which are six tabs (Colors, Text, Cursor, Background, Effects, Behavior). Changing the cursor moves it; changing the bell rings it; a line under the example names what changed.' },
      { was: 'Four rows are under “Terminal look”; 43 more look rows (bezel, background, effects, cursor) are under “Terminal”, whose heading says “Which shell runs, where it starts, and how panes come back”.', now: 'Every terminal look row is on this page, grouped as Text, Cursor, Background, Effects and Bezel. How the terminal behaves is in Code & tools › Terminal.' }
    ]
  });
  /* ------------------------------------------------------------------ Text & motion: the same idea, an example beside the rows */
  const TXT = { scale: 'general.visual.ui-scale', size: 'general.visual.font-size', room: 'general.visual.interface-density', lines: 'general.visual.line-height', still: 'general.visual.reduce-animations', speed: 'general.visual.animation-speed', contrast: 'general.visual.high-contrast', focus: 'general.visual.focus-indicator' };
  const SPEED = { fast: 0.55, measured: 1, cinematic: 1.8 };
  const isOn = (v) => v === true || /^(on|true|yes)$/i.test(String(v));
  let lastText = null, saidText = '';
  const textNow = () => ({ scale: String(val(TXT.scale) || ''), size: String(val(TXT.size) || ''), room: lab(TXT.room), lines: String(val(TXT.lines) || ''), still: isOn(val(TXT.still)), speed: String(val(TXT.speed) || 'Measured'), contrast: isOn(val(TXT.contrast)), focus: lab(TXT.focus) });
  const sayText = (c) => {
    if (lastText) {
      if (c.scale !== lastText.scale) saidText = `Size of everything: <b>${h(c.scale)}</b>. The whole app grew or shrank, this example with it.`;
      else if (c.size !== lastText.size) saidText = `Text size: <b>${h(c.size)}</b>. Read the two messages.`;
      else if (c.lines !== lastText.lines) saidText = `Line spacing: <b>${h(c.lines)}</b>. Look at the space between the lines of the longer message.`;
      else if (c.room !== lastText.room) saidText = `Spacing: <b>${h(c.room)}</b>. Look at the room around the messages and between the buttons.`;
      else if (c.still !== lastText.still) saidText = c.still ? 'Reduce motion is <b>on</b>. The panel in the example no longer slides; it is simply there.' : 'Reduce motion is <b>off</b>. The panel in the example slides again.';
      else if (c.speed !== lastText.speed) saidText = `Animation speed: <b>${h(c.speed)}</b>. Watch how quickly the panel slides.`;
      else if (c.contrast !== lastText.contrast) saidText = `High contrast is <b>${c.contrast ? 'on' : 'off'}</b>. Look at the edges of the boxes.`;
      else if (c.focus !== lastText.focus) saidText = `Keyboard outline: <b>${h(c.focus)}</b>. Look at the button on the right, which has the keyboard on it.`;
    }
    lastText = c;
    return saidText || 'These change the whole app at once. The example shows each one on its own: text, room, movement, edges and the keyboard outline.';
  };
  const textExample = (c) => `
    <figure class="smx-lk-ex" aria-label="An example of text, spacing, movement and outlines with these choices">
      <div class="smx-lkt-stage" aria-hidden="true">
        <div class="smx-lkt-read" style="line-height:${Number(c.lines) || 1.4}">
          <p class="smx-lkt-you">Add a dark mode to the recipe page</p>
          <p class="smx-lkt-ai">Done. I changed 3 files and the tests pass. The switch is in the page header, and it remembers what you chose the next time you open the page.</p>
        </div>
        <div class="smx-lkt-row"><span class="smx-lkt-btn">A button</span><span class="smx-lkt-btn is-focus">The keyboard is here</span></div>
        <div class="smx-lkt-move" style="--smx-speed:${SPEED[c.speed.toLowerCase()] || 1}"><i></i><span>${c.still ? 'A panel, simply there' : 'A panel sliding in'}</span></div>
      </div>
      <figcaption class="smx-lk-ex-cap">Text <b>${h(c.size)}</b> · line spacing ${h(c.lines)} · ${h(c.room.toLowerCase())} · ${c.still ? 'no movement' : 'movement ' + h(c.speed.toLowerCase())} · ${c.contrast ? 'high contrast · ' : ''}${h(c.focus.toLowerCase())} outline</figcaption>
      <p class="smx-lk-said" aria-live="polite"><i aria-hidden="true"></i><span>${sayText(c)}</span></p>
    </figure>`;
  SMX.extend('look/text', {
    cls: 'is-wide smx-look',
    purpose: 'Make everything easier to read, and calm the movement down if you like. The example beside the choices shows each one.',
    lead: (ctx) => [{ key: 'example', html: textExample(textNow()) }],
    changes: [
      { was: 'Size, spacing, motion and contrast are split between “Size & readability” and a “Fine-tuning” fold, mixed with the wallpaper. Nothing shows what “Animation speed”, “Line spacing” or the keyboard outline will look like before you pick.', now: 'Three short groups (Size, Motion, Easier to see) beside an example that shows text, room, a sliding panel, edges and the keyboard outline, and says which one you just changed.' },
      { was: '“Animation speed” (Fast, Measured, Cinematic) is saved but nothing on the page follows it: no style, attribute or variable changes (2,189 variables compared).', now: 'The example shows what the choice is meant to do: the panel slides faster or slower. The defect is on the list for PMConcept7.' }
    ]
  });
  SMX.extend('look/window', {
    changes: [{ was: '“Window & panels” and “When Puppet Master opens” sit among the look settings of App & Input.', now: 'Their own page: where panels sit, what the app opens on, what comes back after a crash.' }]
  });
})(window);
