/* The listening room (index.html), round two (Fable 5.2): every look's four songs, Pip's voice and the window's
   sounds on one page, with the controls saying what they do: 1 pick a song, 2 walk through the onboarding. */
(function () {
  'use strict';
  const P = window.PipSound, PS = window.PS5, L = window.PMLogo, TH = L.THEMES, root = document.documentElement, body = document.body;
  const $ = (s) => document.querySelector(s), esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const KITS = P.KITS, NAME = { friendly: 'Friendly', glass: 'Glass', basic: 'Basic', phosphor: 'Retro Dark', teletype: 'Retro Light', nier: 'NieR' };
  const PART = { lead: 'tune', bass: 'bass', comp: 'chords', arp: 'arpeggio', drum: 'drums', perc: 'percussion', sparkle: 'bells' };
  const FAMILY = [['encore', 'Encore'], ['band', 'House Band'], ['waltz', 'Marionette Theatre'], ['original', 'Original']];
  // where the person is: what the onboarding tells the sound at each of these moments
  const STEPS = [['Asleep', { asleep: true, chapter: 0, index: 0 }], ['Welcome', { asleep: false, chapter: 0, index: 0 }], ['The computer', { asleep: false, chapter: 1, index: 2 }], ['Project', { asleep: false, chapter: 2, index: 5 }], ['AI', { asleep: false, chapter: 3, index: 9 }], ['Ready', { asleep: false, chapter: 4, index: 10 }]];
  const CHAPTER = ['welcome', 'computer', 'project', 'ai', 'ready'];
  const S = { theme: root.getAttribute('data-theme') || 'friendly-dark', step: 1, playing: false, walk: 0 };
  const scheme = () => TH[S.theme].scheme, themeOfKit = (k) => ({ phosphor: 'retro-dark', teletype: 'retro-light' }[k] || k + '-' + scheme());
  const bpmOf = (song) => (song.meter === 6 ? Math.round(song.bpm / 3) : Math.round(song.bpm)), meterOf = (song) => (song.meter === 4 ? 'four' : song.meter === 3 ? 'three' : 'six-eight');
  let stage = null;

  function applyTheme(t, fromRoot) {
    if (!TH[t]) return;
    S.theme = t; body.dataset.theme = t; body.dataset.fam = TH[t].family; body.dataset.scheme = TH[t].scheme; root.style.colorScheme = TH[t].scheme;
    body.style.setProperty('--wall-img', `url(${window.PIP_WALLS[TH[t].scheme]})`);
    if (!fromRoot && root.getAttribute('data-theme') !== t) { applyTheme.self = true; root.setAttribute('data-theme', t); }
    document.querySelectorAll('[data-pip-mark]').forEach((n) => { n.innerHTML = L.svg({ theme: t, px: +(n.dataset.pipMark || 22), decorative: true }); });
    if (stage) { stage.setTheme(t); scene(); }
    P.setTheme(t);
    $('#rmLook').value = t;
    songs(); steps(); voices(); sync();
  }
  function scene(say) {
    if (!stage) return;
    const st = STEPS[S.step][1];
    // (only when the chapter really is another one: the stage plays its fanfare on every call, and this ran on Play,
    // on Stop and on a change of look, so each of those had a fanfare of its own)
    if (stage.chapter !== CHAPTER[st.chapter]) stage.setChapter(CHAPTER[st.chapter]);
    stage.direct({ chapter: CHAPTER[st.chapter], props: [], pip: { mood: S.playing ? 'happy' : 'idle' } });
    if (say) stage.sayNow(say[0], say[1]);
  }
  /* the person is here now. sound: also play what the window plays on the way there (the step, or the chapter's sting) */
  function setStep(i, sound) {
    const was = STEPS[S.step][1], now = STEPS[i][1];
    S.step = i;
    if (sound && S.playing && !now.asleep && i > 0) { if (was.asleep) P.play('wake'); else P.play('next', { chapter: now.chapter }); }
    P.progress(now);
    if (stage) { stage.sleepZ = !!now.asleep; if (stage.px) stage.px.sleep = stage.sleepZ; scene(); }
    sync();
  }
  function play(id, kit) {
    P.unlock();
    if (kit && kit !== P.kit) applyTheme(themeOfKit(kit));
    if (id) P.setSong(id, kit || P.kit);
    P.progress(STEPS[S.step][1]);
    P.loop('bed', 1); S.playing = true; scene(); sync();
  }
  // Stop is silence: the song, Pip's line, and whatever the stage had looping (its 'bed' is the song itself, so it is
  // left to the line above it)
  function stop() { walk(false); S.playing = false; P.loop('bed', 0); P.hush(); ['snore', 'swing'].forEach((n) => P.loop(n, 0)); scene(); sync(); }
  /* walk it for me: from Pip asleep to Ready, a step every two bars or so, so the parts are heard joining */
  function walk(on) {
    clearTimeout(S.walk); S.walk = 0;
    $('#rmWalk').setAttribute('aria-pressed', String(!!on));
    if (!on) return;
    const next = (i) => {
      setStep(i, i > 0);
      if (i >= STEPS.length - 1) { S.walk = setTimeout(() => walk(false), 400); return; }
      const song = P.song().song, bar = (song.meter || 4) * 60 / song.bpm;
      S.walk = setTimeout(() => next(i + 1), Math.max(5200, Math.min(9500, bar * 2 * 1000 + 400)));
    };
    play(); next(0);
  }

  /* ------------------------------------------------------------------ what the page shows */
  // which parts are in at a step, for one song of this look
  function partsAt(entry, st) {
    const song = entry.song; if (!song.tracks) return st.asleep || st.chapter < 1 ? ['tune', 'bass'] : ['tune', 'bass', 'fifths'];
    const I = entry.level(st), out = [];
    Object.keys(song.tracks).forEach((n) => { const T = song.tracks[n], on = T.when ? false : T.at ? T.at.indexOf(I) >= 0 : I >= (T.from || 0) && I <= (T.to == null ? 99 : T.to), name = PART[T.role]; if (on && name && out.indexOf(name) < 0) out.push(name); });
    return out;
  }
  function songs() {
    const list = P.songs();
    $('#rmLookName').textContent = 'in ' + NAME[P.kit];
    $('#rmSongs').innerHTML = list.map((s) => { const e = PS.SONGS[P.kit].find((x) => x.id === s.id); return `<button type="button" class="rm-song" role="radio" aria-checked="${s.chosen}" data-song="${s.id}"><b>${esc(s.title)}${s.isDefault ? '<i class="rm-dot" title="The song this look starts with"></i>' : ''}</b><span>${s.id === 'original' ? 'The tune of today' : esc(s.family)} · ${bpmOf(e.song)} BPM</span></button>`; }).join('');
  }
  function steps() {
    const e = PS.SONGS[P.kit].find((x) => x.id === P.song().id) || PS.SONGS[P.kit][0]; let before = [];
    $('#rmSteps').innerHTML = STEPS.map(([n, st], i) => { const now = partsAt(e, st), added = now.filter((x) => before.indexOf(x) < 0), gone = before.filter((x) => now.indexOf(x) < 0); before = now; const note = i === 0 ? now.join(', ') + ' alone' : (added.length ? '+ ' + added.join(', ') : gone.length ? 'fewer parts' : 'the same parts'); return `<button type="button" class="rm-step" role="radio" aria-checked="${i === S.step}" data-step="${i}"><b>${n}</b><span>${esc(note)}</span></button>`; }).join('');
  }
  function voices() {
    const list = P.voices();
    $('#rmVoices').hidden = list.length < 2;
    $('#rmVoices').innerHTML = '<span class="rm-vk">Which take</span>' + list.map((v, i) => `<button type="button" class="rm-btn" role="radio" aria-checked="${v.chosen}" data-voice="${v.id || ''}">${i === 0 ? 'Round two: ' : ''}${esc(v.name)}</button>`).join('');
  }
  function sync() {
    const e = P.song(), kit = P.kit, song = e.song;
    $('#rmHint').hidden = P.unlocked;
    $('#rmTitle').textContent = P.muted ? 'Sound is off' : !S.playing ? 'Nothing playing' : `${NAME[kit]} · ${e.id === 'original' ? 'the original tune' : '“' + e.title + '”'}`;
    $('#rmMeta').textContent = P.muted ? 'Switch it on in the sound menu.' : !S.playing ? 'Pick a song and press Play.' : `${bpmOf(song)} BPM in ${meterOf(song)}${P.jukebox ? ' · jukebox' : ''}`;
    const seen = {}, rows = !S.playing ? [] : P.parts().filter((q) => q.role && PART[q.role]).filter((q) => { if (seen[q.role]) { seen[q.role].on = seen[q.role].on || q.on; return false; } seen[q.role] = q; return true; });
    $('#rmParts').innerHTML = rows.map((q) => `<i class="${q.on ? 'on' : ''}">${PART[q.role]}</i>`).join('');
    document.querySelectorAll('#rmSteps .rm-step').forEach((b, i) => b.setAttribute('aria-checked', String(i === S.step)));
    document.querySelectorAll('#rmSongs .rm-song').forEach((b) => { b.setAttribute('aria-checked', String(b.dataset.song === e.id)); b.toggleAttribute('data-playing', S.playing && !P.muted && b.dataset.song === e.id); });
    document.querySelectorAll('.rm-cell').forEach((b) => b.setAttribute('aria-pressed', String(S.playing && !P.muted && b.dataset.k === kit && b.dataset.song === e.id)));
    $('#rmJuke').setAttribute('aria-pressed', String(P.jukebox));
    $('#rmOpen').href = 'onboarding.html?theme=' + encodeURIComponent(S.theme);
  }

  /* ------------------------------------------------------------------ building the page */
  $('#rmLook').innerHTML = L.THEME_ORDER.map((t) => `<option value="${t}">${esc(TH[t].label)}</option>`).join('');
  $('#rmLook').addEventListener('change', (e) => applyTheme(e.target.value));
  $('#rmSongs').addEventListener('click', (e) => { const b = e.target.closest('[data-song]'); if (b) play(b.dataset.song); });
  $('#rmSteps').addEventListener('click', (e) => { const b = e.target.closest('[data-step]'); if (!b) return; P.unlock(); walk(false); if (!S.playing) play(); setStep(+b.dataset.step, true); });
  $('#rmPlay').addEventListener('click', () => play());
  $('#rmStop').addEventListener('click', stop);
  $('#rmWalk').addEventListener('click', () => walk($('#rmWalk').getAttribute('aria-pressed') !== 'true'));
  $('#rmJuke').addEventListener('click', () => { P.unlock(); P.setJukebox(!P.jukebox); if (P.jukebox && !S.playing) play(); sync(); });
  $('#rmSound').addEventListener('click', (e) => window.PipSoundMenu.toggle(e.currentTarget));
  [['#rmWork', 'work'], ['#rmPower', 'power']].forEach(([id, name]) => $(id).addEventListener('click', (e) => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', String(on)); P.loop(name, on ? 1 : 0); if (stage && name === 'work') stage.work = on; setTimeout(sync, 0); }));

  const cell = (k, id) => { const e = PS.SONGS[k].find((x) => x.id === id), song = e.song, def = PS.DEFAULT_SONG[k] === id; return `<button type="button" class="rm-cell" data-k="${k}" data-song="${id}" aria-pressed="false" aria-label="${NAME[k]}: ${id === 'original' ? 'the original tune' : esc(song.title)}${def ? ', the song this look starts with' : ''}"><b><span class="rm-eq" aria-hidden="true"><i></i><i></i><i></i></span>${id === 'original' ? 'Original' : esc(song.title)}${def ? '<i class="rm-dot"></i>' : ''}</b><span>${bpmOf(song)} BPM · in ${meterOf(song)}</span></button>`; };
  $('#rmGrid').innerHTML = '<span class="rm-hd"></span>' + FAMILY.map(([, n]) => `<span class="rm-hd">${n}</span>`).join('') + KITS.map((k) => `<span class="rm-look">${NAME[k]}</span>` + FAMILY.map(([id]) => cell(k, id)).join('')).join('');
  $('#rmGrid').addEventListener('click', (e) => { const b = e.target.closest('.rm-cell'); if (!b) return; if (S.playing && b.getAttribute('aria-pressed') === 'true') { stop(); return; } play(b.dataset.song, b.dataset.k); });

  const MOODS = ['idle', 'happy', 'wonder', 'think', 'alert', 'oops', 'watch', 'sleep'];
  $('#rmMood').innerHTML = MOODS.map((m) => `<option value="${m}">${m[0].toUpperCase() + m.slice(1)}</option>`).join(''); $('#rmMood').value = 'happy';
  const LINES = [["Oh! Hi, I'm Pip.", 'happy'], ['What shall we call it?', 'wonder'], ['Right here works great.', 'happy'], ["Hmm, that key didn't work.", 'oops'], ['Every version goes in the vault, safe and sound.', 'idle'], ["We're ready. Let's make something!", 'happy'], ['Wait... is that a question?', 'think']];
  $('#rmLines').innerHTML = LINES.map(([t], i) => `<button type="button" class="rm-btn" data-line="${i}">${esc(t)}</button>`).join('');
  const say = (text, mood) => { P.unlock(); if (stage) { stage.feel(mood === 'idle' ? 'happy' : mood, 2600); stage.sayNow(text, mood); } else P.say(text, { mood }); sync(); };
  $('#rmSay').addEventListener('click', () => say($('#rmText').value, $('#rmMood').value));
  $('#rmText').addEventListener('keydown', (e) => { if (e.key === 'Enter') say($('#rmText').value, $('#rmMood').value); });
  $('#rmLines').addEventListener('click', (e) => { const b = e.target.closest('[data-line]'); if (b) { const [t, m] = LINES[+b.dataset.line]; $('#rmText').value = t; $('#rmMood').value = m; say(t, m); } });
  $('#rmVoices').addEventListener('click', (e) => { const b = e.target.closest('[data-voice]'); if (!b) return; P.setVoice(b.dataset.voice || null); voices(); say($('#rmText').value, $('#rmMood').value); });

  const EV = [['The window', [['tap', 'Tap'], ['select', 'Choose'], ['toggleOn', 'Switch on'], ['toggleOff', 'Switch off'], ['next', 'Continue'], ['back', 'Back'], ['open', 'Open'], ['close', 'Close'], ['key', 'Type a letter'], ['warn', 'Not allowed'], ['tip', 'Ask Pip (?)'], ['busy', 'A busy click']]],
    ['The stage', [['lower', 'A prop comes down'], ['land', 'It lands'], ['lift', 'It lifts away'], ['hop', 'Pip hops'], ['sparkle', 'Sparkle'], ['rail', 'Pip rides the rail'], ['tick', 'Review tick'], ['block', 'A block is set'], ['power', 'AI connects'], ['chapter', 'New chapter'], ['cheer', 'Cheer'], ['confetti', 'Confetti'], ['crew', 'The crew']]],
    ['Pip, without words', [['wake', 'Wakes'], ['sleep', 'Dozes off'], ['think', 'Thinks'], ['happy', 'Happy'], ['wink', 'Winks'], ['alert', 'Notices']]]];
  $('#rmEvents').innerHTML = EV.map(([g, list]) => `<span class="rm-evgroup">${g}</span>` + list.map(([id, l]) => `<button type="button" class="rm-ev" data-ev="${id}"${id === 'busy' ? ' title="Everything one Continue can set off at once: the step, a new chapter, props leaving and landing, Pip\'s reaction and a line. It is heard as one sound, then Pip."' : ''}>${l}</button>`).join('')).join('');
  const counts = {};
  $('#rmEvents').addEventListener('click', (e) => {
    const b = e.target.closest('[data-ev]'); if (!b) return;
    P.unlock(); const ev = b.dataset.ev, n = counts[ev] = ((counts[ev] == null ? -1 : counts[ev]) + 1), ch = STEPS[S.step][1].chapter;
    if (ev === 'busy') {
      // everything the window and the stage ask for when one Continue opens a new chapter
      const to = (ch % 4) + 1; P.progress({ chapter: ch }); P.play('next', { chapter: to }); P.play('happy'); P.play('lift'); P.play('lift'); P.play('lower');
      setTimeout(() => { P.play('lower'); P.play('chapter', { chapter: to }); }, 200); setTimeout(() => { P.play('land'); P.play('land'); P.play('sparkle'); }, 380);
      setTimeout(() => say('Right here works great.', 'happy'), 120); setTimeout(() => P.progress({ chapter: ch }), 2600);
      return;
    }
    const op = { index: ev === 'key' ? n : n % 4, count: 4, chapter: ch };
    if (ev === 'chapter') op.chapter = (n % 4) + 1;
    P.play(ev, op);
    if (stage && !stage.reduced) { if (ev === 'hop') stage.hop(0.6); if (/cheer|confetti|crew|sparkle/.test(ev)) stage.feel('happy', 1400); if (ev === 'warn') stage.feel('oops', 1400); if (ev === 'confetti' && stage.famName !== 'nier') { const sf = stage.sfx; stage.sfx = () => {}; stage.confetti(40); stage.sfx = sf; } }
  });

  /* ------------------------------------------------------------------ Pip's stage, and the look
     The stage stands in the same upright frame it has in the onboarding window, so every world is laid out as it was
     drawn for (in round one's wide box the two Retro tubes drew Pip far too large). */
  try {
    stage = new window.PipStage.Stage($('#rmStage'), { theme: S.theme, layout: 'portrait', reduced: root.getAttribute('data-reduced-motion') === '1' });
    /* The stage keeps its own sounds to the song. In the onboarding Pip sleeps for three seconds at most, so its snore
       (two breaths and two soft falling notes, every 3.8 s) is heard once. Here Pip stays asleep for as long as the
       Asleep step is chosen, and the snore went on over the song and on after Stop (Jared, 20 Nov 2026: "a constant
       de doo sound in the background"). So: no snore in this room, and when no song plays the stage is silent. */
    const stageSfx = stage.sfx.bind(stage), stageLoop = stage.loopSnd.bind(stage);
    stage.sfx = (ev, o) => { if (S.playing) stageSfx(ev, o); };
    stage.loopSnd = (name, level) => stageLoop(name, name === 'snore' || !S.playing ? 0 : level);
    new ResizeObserver(() => { stage.setLayout('portrait'); scene(); }).observe($('#rmStage').parentNode);
  } catch (e) { stage = null; }
  new MutationObserver(() => {
    if (applyTheme.self) { applyTheme.self = false; return; }
    const t = root.getAttribute('data-theme'), r = root.getAttribute('data-reduced-motion') === '1';
    if (TH[t] && t !== S.theme) applyTheme(t, true);
    if (stage && r !== stage.reduced) { stage.setReduced(r); P.setReduced(r); }
  }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-reduced-motion'] });
  const mq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  if (mq && mq.matches && stage) { stage.setReduced(true); P.setReduced(true); }
  ['progress', 'unlock', 'mute', 'music', 'jukebox'].forEach((t) => P.on(t, () => setTimeout(sync, 0)));
  P.on('song', () => setTimeout(() => { songs(); steps(); sync(); }, 0));
  try { const q = new URLSearchParams(location.search); if (TH[q.get('theme')]) S.theme = q.get('theme'); } catch (e) { /* file:// */ }
  applyTheme(S.theme);
  setStep(1);
  window.__room = { S, play, stop, walk, setStep, stage: () => stage };
})();
