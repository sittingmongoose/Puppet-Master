/* The listening room (index.html): every tune, voice and sound of the three concepts, side by side (Fable 5.2). */
(function () {
  'use strict';
  const P = window.PipSound, L = window.PMLogo, TH = L.THEMES, root = document.documentElement, body = document.body;
  const $ = (s) => document.querySelector(s), esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const KITS = ['friendly', 'glass', 'basic', 'phosphor', 'teletype', 'nier'], NAME = { friendly: 'Friendly', glass: 'Glass', basic: 'Basic', phosphor: 'Retro Dark', teletype: 'Retro Light', nier: 'NieR' };
  const PART = { lead: 'tune', bass: 'bass', comp: 'chords', arp: 'arpeggio', drum: 'drums', perc: 'percussion', sparkle: 'bells' };
  const STEPS = [['Asleep', { asleep: true, chapter: 0, index: 0 }], ['Welcome', { asleep: false, chapter: 0, index: 0 }], ['Computer', { asleep: false, chapter: 1, index: 2 }], ['Project', { asleep: false, chapter: 2, index: 5 }], ['AI', { asleep: false, chapter: 3, index: 9 }], ['Ready', { asleep: false, chapter: 4, index: 10 }]];
  const CHAPTER = ['welcome', 'computer', 'project', 'ai', 'ready'];
  const LISTEN = {
    c1: ["Today's tunes, note for note, in a fuller arrangement: a harmony, a bass, an inner part, light percussion.", 'Parts join by chapter; asleep, it is the theme alone, as today.', 'A new bridge makes each one an AABA song.'],
    c2: ['Each look is a genre: ukulele trio, dream pop, jazz trio, chiptune, typewriter rag, piano and music box.', 'Step through "how far along": a player joins at each step.', 'Clicks are hits from the band, on the beat and in the chord.'],
    c3: ['Everything is in three: waltzes, and two slow six-eights.', 'Clicks are stage machinery: ratchets, pulleys, a knock, a bell.', 'Typing a name plays the music box; NieR turns to major at Ready.'],
    orig: ['A quiet eight-bar tune behind the window, with rests.', 'Kept here unchanged, so the three can be judged against it.']
  };
  const S = { theme: root.getAttribute('data-theme') || 'friendly-dark', step: 5, playing: false, concept: 'c1' };
  const scheme = () => TH[S.theme].scheme, themeOfKit = (k) => ({ phosphor: 'retro-dark', teletype: 'retro-light' }[k] || k + '-' + scheme());
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
    sync();
  }
  function scene(say) {
    if (!stage) return;
    const st = STEPS[S.step][1];
    stage.setChapter(CHAPTER[st.chapter]);
    stage.direct({ chapter: CHAPTER[st.chapter], props: [], pip: { mood: S.playing ? 'happy' : 'idle' } });
    if (say) stage.sayNow(say[0], say[1]);
  }
  function setStep(i) {
    S.step = i; P.progress(STEPS[i][1]);
    if (stage) { stage.sleepZ = !!STEPS[i][1].asleep; if (stage.px) stage.px.sleep = stage.sleepZ; scene(); }
    sync();
  }
  function play(concept, kit) {
    P.unlock();
    if (concept) { S.concept = concept; P.setConcept(concept); }
    if (kit) applyTheme(themeOfKit(kit));
    P.progress(STEPS[S.step][1]);
    P.loop('bed', 1); S.playing = true; scene(); sync();
  }
  function stop() { P.loop('bed', 0); P.hush(); S.playing = false; scene(); sync(); }

  function sync() {
    const c = P.concept, song = P.song(), kit = P.kit, C = P.CONCEPTS().find((x) => x.id === c);
    $('#rmHint').hidden = P.unlocked;
    $('#rmSound').setAttribute('aria-pressed', String(!P.muted)); $('#rmSound').textContent = P.muted ? 'Sound off' : 'Sound on';
    $('#rmTitle').textContent = !S.playing ? 'Nothing playing' : c === 'orig' ? `${NAME[kit]} · PMConcept7 today` : `${NAME[kit]} · “${song.title}”`;
    $('#rmMeta').textContent = !S.playing ? 'Pick a tune below, or press Play.' : c === 'orig' ? "the tune PMConcept7's onboarding plays now" : `${C.name} · ${song.meter === 6 ? Math.round(song.bpm / 3) : song.bpm} BPM in ${song.meter === 4 ? 'four' : song.meter === 3 ? 'three' : 'six-eight'}`;
    const seen = {}, rows = c === 'orig' ? [] : P.parts().filter((q) => q.role && PART[q.role]).filter((q) => { if (seen[q.role]) { seen[q.role].on = seen[q.role].on || q.on; return false; } seen[q.role] = q; return true; });
    $('#rmParts').innerHTML = rows.map((q) => `<i class="${q.on ? 'on' : ''}">${PART[q.role]}</i>`).join('');
    document.querySelectorAll('#rmSteps button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === S.step)));
    document.querySelectorAll('.rm-cell').forEach((b) => b.setAttribute('aria-pressed', String(S.playing && b.dataset.c === c && b.dataset.k === kit)));
    document.querySelectorAll('[data-open-concept]').forEach((a) => { a.href = a.dataset.openConcept + '?theme=' + encodeURIComponent(S.theme); });
  }

  /* ------------------------------------------------------------------ building the page */
  $('#rmLook').innerHTML = L.THEME_ORDER.map((t) => `<option value="${t}">${esc(TH[t].label)}</option>`).join('');
  $('#rmLook').addEventListener('change', (e) => applyTheme(e.target.value));
  $('#rmSteps').innerHTML = STEPS.map(([n], i) => `<button type="button" class="rm-btn" data-step="${i}" aria-pressed="false">${n}</button>`).join('');
  $('#rmSteps').addEventListener('click', (e) => { const b = e.target.closest('[data-step]'); if (b) { P.unlock(); setStep(+b.dataset.step); } });
  $('#rmMix').innerHTML = [['music', 'Music'], ['voice', 'Pip'], ['sfx', 'Effects']].map(([k, l]) => `<label>${l}<input type="range" min="0" max="150" step="5" value="${Math.round(P.volume(k) * 100)}" data-vol="${k}" aria-label="${l} volume"></label>`).join('');
  $('#rmMix').addEventListener('input', (e) => { const k = e.target.dataset.vol; if (k) P.volume(k, e.target.value / 100); });
  $('#rmPlay').addEventListener('click', () => play());
  $('#rmStop').addEventListener('click', stop);
  [['#rmWork', 'work'], ['#rmPower', 'power']].forEach(([id, name]) => $(id).addEventListener('click', (e) => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', String(on)); P.loop(name, on ? 1 : 0); if (stage) { stage.work = name === 'work' ? on : stage.work; } setTimeout(sync, 0); }));
  $('#rmSound').addEventListener('click', () => { P.toggle(); if (P.muted) S.playing = false; sync(); });

  const all = P.CONCEPTS(), PAGE = ['concept-1.html', 'concept-2.html', 'concept-3.html'];   // (named whole, so a single-file build can rename them)
  $('#rmConcepts').innerHTML = all.filter((c) => c.id !== 'orig').map((c, i) => `<div class="rm-card"><h3>${i + 1} · ${esc(c.name)}</h3><p>${esc(c.blurb)}</p><ul>${LISTEN[c.id].map((x) => `<li>${esc(x)}</li>`).join('')}</ul><div class="rm-row"><button type="button" class="rm-btn rm-primary" data-play-concept="${c.id}">Play in this look</button><a class="rm-btn" data-open-concept="${PAGE[i]}" href="${PAGE[i]}">Open the onboarding</a></div></div>`).join('');
  $('#rmConcepts').addEventListener('click', (e) => { const b = e.target.closest('[data-play-concept]'); if (b) play(b.dataset.playConcept, P.kit); });
  const cell = (c, k) => { const C = window.PS5.concepts[c], song = C && C.looks[k].song; return `<button type="button" class="rm-cell" data-c="${c}" data-k="${k}" aria-pressed="false" aria-label="${NAME[k]}, ${c === 'orig' ? 'PMConcept7 today' : C.name + ': ' + song.title}"><b><span class="rm-eq" aria-hidden="true"><i></i><i></i><i></i></span>${c === 'orig' ? 'Today\'s tune' : esc(song.title)}</b><span>${c === 'orig' ? 'eight quiet bars' : (song.meter === 6 ? Math.round(song.bpm / 3) : song.bpm) + ' BPM · in ' + (song.meter === 4 ? 'four' : song.meter === 3 ? 'three' : 'six-eight')}</span></button>`; };
  $('#rmGrid').innerHTML = '<span class="rm-hd"></span>' + all.map((c, i) => `<span class="rm-hd">${c.id === 'orig' ? 'Today' : (i + 1) + ' · ' + esc(c.name)}</span>`).join('') + KITS.map((k) => `<span class="rm-look">${NAME[k]}</span>` + all.map((c) => cell(c.id, k)).join('')).join('');
  $('#rmGrid').addEventListener('click', (e) => { const b = e.target.closest('.rm-cell'); if (!b) return; if (S.playing && b.getAttribute('aria-pressed') === 'true') { stop(); return; } play(b.dataset.c, b.dataset.k); });

  const MOODS = ['idle', 'happy', 'wonder', 'think', 'alert', 'oops', 'watch', 'sleep'];
  $('#rmMood').innerHTML = MOODS.map((m) => `<option value="${m}">${m[0].toUpperCase() + m.slice(1)}</option>`).join(''); $('#rmMood').value = 'happy';
  const LINES = [["Oh! Hi, I'm Pip.", 'happy'], ['What shall we call it?', 'wonder'], ['Right here works great.', 'happy'], ["Hmm, that key didn't work.", 'oops'], ['Every version goes in the vault, safe and sound.', 'idle'], ["We're ready. Let's make something!", 'happy'], ['Wait... is that a question?', 'think']];
  $('#rmLines').innerHTML = LINES.map(([t], i) => `<button type="button" class="rm-btn" data-line="${i}">${esc(t)}</button>`).join('');
  const say = (text, mood) => { P.unlock(); if (stage) { stage.feel(mood === 'idle' ? 'happy' : mood, 2600); stage.sayNow(text, mood); } else P.say(text, { mood }); sync(); };
  $('#rmSay').addEventListener('click', () => say($('#rmText').value, $('#rmMood').value));
  $('#rmText').addEventListener('keydown', (e) => { if (e.key === 'Enter') say($('#rmText').value, $('#rmMood').value); });
  $('#rmLines').addEventListener('click', (e) => { const b = e.target.closest('[data-line]'); if (b) { const [t, m] = LINES[+b.dataset.line]; $('#rmText').value = t; $('#rmMood').value = m; say(t, m); } });

  const EV = [['The window', [['tap', 'Tap'], ['select', 'Choose'], ['toggleOn', 'Switch on'], ['toggleOff', 'Switch off'], ['next', 'Continue'], ['back', 'Back'], ['open', 'Open'], ['close', 'Close'], ['key', 'Type a letter'], ['warn', 'Something is wrong'], ['tip', 'Ask Pip (?)']]],
    ['The stage', [['lower', 'A prop comes down'], ['land', 'It lands'], ['lift', 'It lifts away'], ['hop', 'Pip hops'], ['sparkle', 'Sparkle'], ['rail', 'Pip rides the rail'], ['tick', 'Review tick'], ['block', 'A block is set'], ['power', 'AI connects'], ['chapter', 'New chapter'], ['cheer', 'Cheer'], ['confetti', 'Confetti'], ['crew', 'The crew']]],
    ['Pip, without words', [['wake', 'Wakes'], ['sleep', 'Dozes off'], ['think', 'Thinks'], ['happy', 'Happy'], ['wink', 'Winks'], ['alert', 'Notices']]]];
  $('#rmEvents').innerHTML = EV.map(([g, list]) => `<span class="rm-evgroup">${g}</span>` + list.map(([id, l]) => `<button type="button" class="rm-ev" data-ev="${id}">${l}</button>`).join('')).join('');
  const counts = {};
  $('#rmEvents').addEventListener('click', (e) => {
    const b = e.target.closest('[data-ev]'); if (!b) return;
    P.unlock(); const ev = b.dataset.ev, n = counts[ev] = ((counts[ev] == null ? -1 : counts[ev]) + 1);
    const op = { index: ev === 'key' ? n : n % 4, count: 4, chapter: STEPS[S.step][1].chapter };
    if (ev === 'chapter') op.chapter = (n % 4) + 1;
    P.play(ev, op);
    if (stage && !stage.reduced) { if (ev === 'hop') stage.hop(0.6); if (/cheer|confetti|crew|sparkle/.test(ev)) stage.feel('happy', 1400); if (ev === 'warn') stage.feel('oops', 1400); if (ev === 'confetti' && stage.famName !== 'nier') { const sf = stage.sfx; stage.sfx = () => {}; stage.confetti(40); stage.sfx = sf; } }
  });

  /* ------------------------------------------------------------------ Pip's stage, and the look */
  try {
    stage = new window.PipStage.Stage($('#rmStage'), { theme: S.theme, layout: 'portrait', reduced: root.getAttribute('data-reduced-motion') === '1' });
    const fit = () => { const w = $('#rmStage').parentNode.getBoundingClientRect().width; stage.setLayout(w < 430 ? 'compact' : 'portrait'); scene(); };
    new ResizeObserver(fit).observe($('#rmStage').parentNode); fit();
  } catch (e) { stage = null; }
  new MutationObserver(() => {
    if (applyTheme.self) { applyTheme.self = false; return; }
    const t = root.getAttribute('data-theme'), r = root.getAttribute('data-reduced-motion') === '1';
    if (TH[t] && t !== S.theme) applyTheme(t, true);
    if (stage && r !== stage.reduced) { stage.setReduced(r); P.setReduced(r); }
  }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-reduced-motion'] });
  const mq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  if (mq && mq.matches && stage) { stage.setReduced(true); P.setReduced(true); }
  ['concept', 'progress', 'unlock', 'mute', 'music', 'orig'].forEach((t) => P.on(t, sync));
  try { const q = new URLSearchParams(location.search); if (TH[q.get('theme')]) S.theme = q.get('theme'); } catch (e) { /* file:// */ }
  applyTheme(S.theme);
  setStep(5);
  window.__room = { S, play, stop, stage: () => stage };
})();
