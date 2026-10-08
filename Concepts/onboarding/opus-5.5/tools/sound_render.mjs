/* Sound verification: offline render of every kit x event x variant (O55.sound.renderBuffer, an OfflineAudioContext,
 * so it works under --mute-audio and ignores the mute), plus live checks in the page.
 *   node tools/sound_render.mjs <out-dir> [--page <built.html>] [--no-wav] [--no-live]
 * Writes <out>/<kit>/<event>[-<n>].wav (16-bit mono) and sound.json:
 *   renders[kit][event] = [{ variant, peak, peakDb, rmsDb, lk, seconds, trim }]   (one per variant)
 *     rmsDb  RMS over the 10 ms windows within 20 dB of the loudest one (the sound's body, not its silence)
 *     lk     the same over a K-weighted signal (ITU-R BS.1770 pre-filter: +4 dB shelf above ~1.7 kHz, high-pass at
 *            38 Hz), a closer guess at how loud it sounds; tools/sound_catalog.py levels the kits on it
 *   depths[kit][event] = [{ depth, variant, peak, peakDb, rmsDb, lk, seconds }]   the stings ('chapter', and NieR's
 *     'quest' takes) rendered at every depth 0..4 (the library previews depth 4), so a 1-note sting is levelled too
 *   catalog: the CATALOG length and a render check of every entry (finite, not silent, peak < 0.9, a title and an about)
 *   live: a real click unlocks audio; every event in every kit plays (log played:true, no error) with NieR off and on;
 *         unknown events fall back; the NieR kit follows NieR Mode and its Menu sounds part; the mute, reload binding;
 *         and the hero pass's rules: runs, claimed stings and re-entry, the depth by chapter, rest, the found/success
 *         deferral, the celebration's layer after commit/finish/save, foley under texture and its Reduced Motion and
 *         landing limits, a stage sound's pan from its voice, and Pod 042's 8-bit Show Me voice
 * tools/sound_board.py then builds listening boards and spectrograms; tools/sound_catalog.py writes TRIM and DUR.
 * Chrome comes from tools/chrome.mjs (set CHROME to a GPU wrapper on the VM). */
import { launch, sleep } from './chrome.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (k) => args.includes('--' + k);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const pageFile = resolve(opt('page', resolve(here, '../../../TestOpus5.5PmConcept.html')));
const out = resolve(args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1] === '--page')) || '/tmp/o55/sound');
mkdirSync(out, { recursive: true });
const { page, close } = await launch({ width: 1440, height: 900 });
const report = { page: pageFile, renders: {}, catalog: null, live: {} };

/* in the page: render one entry and measure it (and encode the WAV when asked) */
const measure = async (kit, ev, v, wav, ro) => {
  const S = window.O55.sound, buf = await S.renderBuffer(kit, ev, v, ro || undefined);
  if (!buf) return null;
  const n = buf.length, rate = buf.sampleRate, m = new Float32Array(n);
  for (let ch = 0; ch < buf.numberOfChannels; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < n; i++) m[i] += d[i] / buf.numberOfChannels; }
  let peak = 0, finite = true;
  for (let ch = 0; ch < buf.numberOfChannels; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < n; i++) { const a = Math.abs(d[i]); if (!Number.isFinite(a)) finite = false; else if (a > peak) peak = a; } }
  const biquad = (x, b0, b1, b2, a1, a2) => { const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v0 = x[i], o = b0 * v0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = v0; y2 = y1; y1 = o; y[i] = o; } return y; };
  const rbj = (type, f0, q, gainDb) => {
    const A = Math.pow(10, gainDb / 40), w = 2 * Math.PI * f0 / rate, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q);
    let b0, b1, b2, a0, a1, a2;
    if (type === 'highshelf') { const r = 2 * Math.sqrt(A) * al; b0 = A * ((A + 1) + (A - 1) * c + r); b1 = -2 * A * ((A - 1) + (A + 1) * c); b2 = A * ((A + 1) + (A - 1) * c - r); a0 = (A + 1) - (A - 1) * c + r; a1 = 2 * ((A - 1) - (A + 1) * c); a2 = (A + 1) - (A - 1) * c - r; }
    else { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
  };
  const kw = biquad(biquad(m, ...rbj('highshelf', 1681.97, 0.7072, 4)), ...rbj('highpass', 38.14, 0.5003, 0));
  const gated = (x) => { const W = Math.round(rate * 0.01), w = []; for (let i = 0; i + W <= x.length; i += W) { let p = 0; for (let j = i; j < i + W; j++) p += x[j] * x[j]; w.push(p / W); } const top = w.length ? Math.max(...w) : 0, act = w.filter((p) => p > top / 100); return act.length ? Math.sqrt(act.reduce((a, b) => a + b, 0) / act.length) : 0; };
  const db = (x) => +(20 * Math.log10(Math.max(1e-9, x))).toFixed(2);
  const res = { variant: v, peak: +peak.toFixed(4), peakDb: db(peak), rmsDb: db(gated(m)), lk: db(gated(kw)), seconds: +(n / rate).toFixed(3), finite };
  if (wav) {
    const bytes = new DataView(new ArrayBuffer(44 + n * 2)), w = (o, s) => { for (let i = 0; i < s.length; i++) bytes.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); bytes.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); bytes.setUint32(16, 16, true); bytes.setUint16(20, 1, true); bytes.setUint16(22, 1, true);
    bytes.setUint32(24, rate, true); bytes.setUint32(28, rate * 2, true); bytes.setUint16(32, 2, true); bytes.setUint16(34, 16, true); w(36, 'data'); bytes.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) bytes.setInt16(44 + i * 2, Math.max(-1, Math.min(1, m[i])) * 0x7fff, true);
    let bin = ''; const u8 = new Uint8Array(bytes.buffer); for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    res.base64 = btoa(bin);
  }
  return res;
};

try {
  await page.goto(pathToFileURL(pageFile).href + '?o55=off');
  await page.waitFor(() => !!(window.O55 && window.O55.sound && window.O55.sound.CATALOG), { timeout: 30000 });
  await sleep(800);
  const { kits, events } = await page.evaluate(() => {
    const S = window.O55.sound, kits = {};
    S.KIT_NAMES.forEach((k) => { kits[k] = {}; S.EVENTS.forEach((e) => { const n = S.variants(k, e); if (n) kits[k][e] = n; }); });
    return { kits, events: S.EVENTS };
  });
  report.events = events;
  for (const [kit, evs] of Object.entries(kits)) {
    mkdirSync(join(out, kit), { recursive: true });
    report.renders[kit] = {};
    for (const [ev, n] of Object.entries(evs)) {
      report.renders[kit][ev] = [];
      for (let v = 0; v < n; v++) {
        const r = await page.evaluate(measure, kit, ev, v, !flag('no-wav'));
        if (!r) { report.renders[kit][ev].push(null); continue; }
        if (r.base64) { writeFileSync(join(out, kit, `${ev}${n > 1 ? '-' + (v + 1) : ''}.wav`), Buffer.from(r.base64, 'base64')); delete r.base64; }
        report.renders[kit][ev].push(r);
      }
    }
  }
  /* the stings at every depth: every kit's chapter (variant 0) and each of NieR's quest takes */
  report.depths = {};
  for (const kit of Object.keys(kits)) {
    report.depths[kit] = {};
    for (const ev of ['chapter', 'quest']) {
      const n = kits[kit][ev]; if (!n) continue;
      report.depths[kit][ev] = [];
      for (let v = 0; v < n; v++) for (let depth = 0; depth <= 4; depth++) {
        const r = await page.evaluate(measure, kit, ev, v, false, { depth });
        if (r) report.depths[kit][ev].push(Object.assign({ depth }, r));
      }
    }
  }
  /* every library entry renders: finite, not silent, peak under 0.9, with a title and an about line */
  report.catalog = await page.evaluate(async () => {
    const S = window.O55.sound, bad = [];
    for (const e of S.CATALOG) {
      const b = await S.renderBuffer(e.kit, e.event, e.variant);
      let peak = 0, finite = true;
      for (let ch = 0; ch < b.numberOfChannels; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (!Number.isFinite(a)) finite = false; else if (a > peak) peak = a; } }
      if (!finite || peak < 0.003 || peak >= 0.9) bad.push({ id: e.id, peak, finite });
      if (!e.title || !e.about || /^soundLibrary\./.test(e.about) || /^soundLibrary\./.test(e.title)) bad.push({ id: e.id, copy: { title: e.title, about: e.about } });
    }
    const styles = {}; S.CATALOG.forEach((e) => { styles[e.style] = (styles[e.style] || 0) + 1; });
    return { entries: S.CATALOG.length, styles, bad, sample: S.CATALOG.filter((e, i) => i % 40 === 0).map((e) => ({ id: e.id, name: e.name, style: e.style, duration: e.duration })) };
  });

  if (!flag('no-live')) {
    /* a real click is the gesture that unlocks audio; then the onboarding preview is unmuted */
    await page.mouse(700, 450);
    report.live.start = await page.evaluate(() => ({ muted: window.O55.sound.muted, binding: window.O55.sound.binding() }));
    await page.evaluate(() => { if (window.O55.sound.muted) window.O55.sound.setMuted(false, 'check'); });
    /* every event in every kit (forced by opts.kit), spaced past the merge window and the rate limits */
    report.live.events = await page.evaluate(async () => {
      const S = window.O55.sound, wait = (ms) => new Promise((r) => setTimeout(r, ms)), res = { played: 0, failed: [] };
      for (const kit of S.KIT_NAMES) {
        for (const ev of S.EVENTS) {
          const n0 = S.log.length;
          S.play(ev, { kit });
          /* a finish rests 150 ms and then plays (and the rest would drop what follows it): wait past both */
          await wait(ev === 'finish' ? 480 : ev === 'hover' || ev === 'type' ? 140 : 130);
          const e = S.log.slice(n0).find((x) => x.event === ev || x.asked === ev);
          const silentOk = ev === 'hover' && kit !== 'nier';
          if (silentOk ? !(e && e.dropped === 'silent') : !(e && e.played && !e.error)) res.failed.push({ kit, ev, entry: e || null });
          else if (!silentOk) res.played++;
        }
      }
      return res;
    });
    /* the analyser sees signal while a sound plays */
    report.live.analyser = await page.evaluate(async () => {
      const S = window.O55.sound; S.play('commit'); const buf = new Float32Array(S.tap ? S.tap.fftSize : 0); let rms = 0;
      if (S.tap) for (let k = 0; k < 10 && rms < 1e-4; k++) { await new Promise((r) => setTimeout(r, 25)); S.tap.getFloatTimeDomainData(buf); rms = Math.sqrt(buf.reduce((a, v) => a + v * v, 0) / buf.length); }
      return { ctx: S.ctx && S.ctx.state, rms: +rms.toFixed(5) };
    });
    /* unknown events fall back (a new event in a kit that lacks it plays its fallback; a typo stays silent) */
    report.live.fallback = await page.evaluate(async () => {
      const S = window.O55.sound, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
      await wait(250); /* past the merge window of the check before */
      for (const ev of ['pod', 'decode', 'glitch', 'quest', 'nierOn', 'nierOff', 'reboot', 'hover', 'wake', 'showPointer', 'showInterrupt', 'noSuchEvent']) {
        const n0 = S.log.length; S.play(ev, { kit: 'basic' }); await wait(130);
        const e = S.log.slice(n0).find((x) => x.event === ev) || null;
        out[ev] = e && { resolved: e.resolved || null, played: !!e.played, dropped: e.dropped || null };
      }
      return out;
    });
    /* which kit plays: NieR off, NieR on (sounds part on), NieR on with the part off */
    report.live.kit = await page.evaluate(async () => {
      const S = window.O55.sound, N = window.PM_NIER, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
      const kitNow = () => S.kitFor('select', {});
      out.off = kitNow();
      if (N && N.set) {
        N.set(true); await wait(1800);
        out.on = kitNow(); out.onAttr = document.documentElement.getAttribute('data-o55-nier-parts');
        const n0 = S.log.length; S.play('select'); await wait(120); out.onPlayed = S.log.slice(n0).map((x) => x.kit + ':' + x.event + ':' + !!x.played);
        const parts = N.parts(); N.setParts(parts.filter((p) => p !== 'sounds')); await wait(900);
        out.partOff = kitNow(); out.nierOnWithPartOff = S.kitFor('nierOn', {});
        N.setParts(parts); await wait(900);
        out.partBack = kitNow();
        out.menuSfxThroughO55 = await (async () => { const before = S.log.filter((x) => x.event === 'synth').length; window.PM_NIER_PARTS.play('select'); await wait(60); return S.log.filter((x) => x.event === 'synth').length - before; })();
        S.suppress(300); out.suppressed = S.suppressed(); out.heldWhileSuppressed = window.PM_NIER_PARTS.play('select'); await wait(350); out.releasedAfter = !S.suppressed();
        N.set(false); await wait(1800);
        out.after = kitNow();
      }
      return out;
    });
    /* intensity: quiet and dark, and bright, both play */
    report.live.intensity = await page.evaluate(async () => {
      const S = window.O55.sound, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = [];
      for (const i of [0.05, 0.5, 0.95]) { await wait(160); const n0 = S.log.length; S.play('checkpoint', { intensity: i, kit: 'nier' }); await wait(20); const e = S.log.slice(n0)[0]; out.push({ intensity: i, played: !!(e && e.played) }); }
      return out;
    });
    /* the chapter sting: a forward move into a new chapter plays 'chapter' */
    report.live.chapter = await page.evaluate(async () => {
      const S = window.O55.sound, wait = (ms) => new Promise((r) => setTimeout(r, ms));
      await wait(200); S.setContext({ chapter: 'welcome', step: 0 }); S.setContext({ chapter: 'computer', step: 1 });
      const n0 = S.log.length; S.play('next'); await wait(120); S.setContext({ step: 2 }); S.play('next'); await wait(20);
      return S.log.slice(n0).map((x) => ({ event: x.event, asked: x.asked || null, played: !!x.played }));
    });
    /* merging: commit + next + celebrate in one task play commit, with the celebration's sparkles layered */
    report.live.merge = await page.evaluate(async () => {
      const S = window.O55.sound, wait = (ms) => new Promise((r) => setTimeout(r, ms));
      await wait(200); const n0 = S.log.length;
      S.play('next'); S.play('commit'); S.play('celebrate'); S.play('success');
      await wait(700); /* past a success's deferral behind the chapter check's sting: it then gives way to the commit */
      return S.log.slice(n0).map((x) => ({ event: x.event, played: !!x.played, layer: !!x.layer, dropped: x.dropped || null, by: x.by || null }));
    });
    /* the hero pass's rules, each in its own moment (waits keep them past the merge window and the rate limits) */
    report.live.hero = await page.evaluate(async () => {
      const S = window.O55.sound, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {}, k = 'basic';
      const since = (n0) => S.log.slice(n0).map((x) => { const o = { event: x.event }; ['asked', 'kit', 'played', 'dropped', 'by', 'layer', 'layerOf', 'depth', 'voice', 'pan', 'step', 'deferred', 'resolved'].forEach((f) => { if (x[f] != null && x[f] !== false) o[f] = x[f]; }); return o; });
      /* a run: the chapters sting at depths 1, 2, 3; Back across a boundary and forward again is a plain next; Ready
         rests 150 ms and resolves at depth 4 */
      await wait(300); let n0 = S.log.length;
      S.setContext({ run: 'check-1', chapter: 'welcome', step: 0 });
      const walk = ['computer', 'project', 'ai'];
      for (let i = 0; i < walk.length; i++) { await wait(900); S.setContext({ chapter: walk[i], step: i + 1 }); S.play('next', { kit: k }); }
      await wait(900); S.setContext({ chapter: 'project', step: 2 }); S.play('back', { kit: k });
      await wait(900); S.setContext({ chapter: 'ai', step: 3 }); S.play('next', { kit: k });
      await wait(900); S.setContext({ chapter: 'ready', step: 4 }); S.play('next', { kit: k });
      await wait(700); out.run = since(n0);
      /* a claimed sting (sting: false): the move plays plain, the chapter counts, the caller's quest carries the depth;
         a found asked for 100 ms after the quest waits until 500 ms after it */
      n0 = S.log.length;
      S.setContext({ run: 'check-2', chapter: 'welcome', step: 0 }); await wait(200);
      S.setContext({ chapter: 'computer', step: 1, sting: false }); S.play('next', { kit: 'nier' });
      out.claimDepth = S.context().depth;
      await wait(300); S.play('quest', { kit: 'nier', chapter: 'computer', depth: S.context().depth });
      await wait(100); const askedFound = performance.now(); S.play('found', { kit: 'nier' });
      await wait(700); out.claim = since(n0); out.foundWait = Math.round(performance.now() - askedFound);
      /* rest: what is under PRIO 75 is dropped while it lasts; the resolution after it plays */
      await wait(300); n0 = S.log.length;
      S.play('select', { kit: k }); await wait(40); S.rest(150); S.play('tap', { kit: k }); await wait(80); S.play('cheer', { kit: k, voice: 2 }); await wait(120); S.play('chapter', { kit: k, chapter: 'ready', depth: 4 });
      await wait(300); out.rest = since(n0);
      /* the celebration: sparkles 650 ms after a commit, full 1.16 s after a save, sparkles 650 ms after a save */
      await wait(1500); n0 = S.log.length;
      S.play('commit', { kit: k }); await wait(650); S.play('celebrate', { kit: k });
      await wait(2200); S.play('save', { kit: k }); await wait(1160); S.play('celebrate', { kit: k });
      await wait(2400); S.play('save', { kit: k }); await wait(650); S.play('celebrate', { kit: k });
      await wait(300); out.celebrate = since(n0);
      /* foley sits under texture and under a move; at most three landings in 400 ms; a stage sound sits at its voice */
      await wait(400); n0 = S.log.length;
      S.play('move', { kit: 'nier' }); S.play('string', { kit: 'nier', voice: 0 });
      await wait(150);
      for (let i = 0; i < 4; i++) { S.play('land', { kit: 'friendly', voice: i % 3 }); await wait(95); }
      await wait(300); S.play('next', { kit: k }); S.play('bow', { kit: k, voice: 2 });
      await wait(300); out.foley = since(n0);
      /* Reduced Motion: foley is skipped, a state sound still plays */
      const html = document.documentElement, motionWas = html.getAttribute('data-motion');
      html.setAttribute('data-motion', 'reduced');
      await wait(200); n0 = S.log.length;
      S.play('land', { kit: k, voice: 0 }); S.play('string', { kit: k }); await wait(150); S.play('wake', { kit: 'nier' });
      await wait(150); out.reduced = since(n0);
      if (motionWas == null) html.removeAttribute('data-motion'); else html.setAttribute('data-motion', motionWas);
      /* the name sign: each letter's string one step up */
      await wait(1000); n0 = S.log.length;
      for (let i = 1; i <= 9; i++) { S.play('string', { kit: 'friendly', step: i }); await wait(130); }
      out.name = since(n0);
      /* Show Me under NieR: the pointer while the tour demonstrates, the hand-back while it runs, a plain pointer after */
      const T = window.O55.tour; n0 = S.log.length;
      if (T && T.st) {
        const was = T.st.show, running = T.running;
        T.st.show = { cancelled: false }; S.play('pointer', { kit: 'nier' }); await wait(220);
        T.st.show = was; T.running = true; S.play('interrupt', { kit: 'nier' }); await wait(220);
        T.running = running; S.play('pointer', { kit: 'nier' }); await wait(220);
      }
      out.show = since(n0);
      /* the tour is another journey: a run of its own, its chapters from depth 1, and a finish after a rest */
      n0 = S.log.length;
      S.setContext({ chapter: 'tour-ask', step: 0 }); await wait(200);
      S.setContext({ chapter: 'tour-workspace', step: 6 }); S.play('next', { kit: k }); await wait(900);
      S.setContext({ chapter: 'tour-plan', step: 9 }); S.play('next', { kit: k }); await wait(900);
      S.play('finish', { kit: k }); await wait(500);
      out.tour = since(n0);
      return out;
    });
    /* the verdict, rule by rule */
    {
      const h = report.live.hero, V = {}, pl = (x) => x.filter((e) => e.played);
      const stings = h.run.filter((e) => e.event === 'chapter');
      V.depthsInOrder = stings.map((e) => e.depth).join(',') === '1,2,3,4';
      V.reentryPlain = h.run.filter((e) => e.event === 'next' && e.played).length === 1 && h.run.some((e) => e.event === 'back' && e.played);
      V.readyRests = h.run.some((e) => e.event === 'rest') && stings.length === 4 && stings[3].deferred === 150 && !!stings[3].played;
      V.claimPlain = h.claim.some((e) => e.event === 'next' && !e.asked && e.played) && h.claimDepth === 1 && h.claim.some((e) => e.event === 'quest' && e.depth === 1 && e.played);
      const fd = h.claim.find((e) => e.event === 'found');
      V.foundDeferred = !!(fd && fd.played && fd.deferred >= 350 && fd.deferred <= 450);
      const r = h.rest;
      V.rest = !!(r.find((e) => e.event === 'select' && e.played) && r.find((e) => e.event === 'tap' && e.dropped === 'rest') && r.find((e) => e.event === 'cheer' && e.dropped === 'rest') && r.find((e) => e.event === 'chapter' && e.played));
      const ce = h.celebrate.filter((e) => e.event === 'celebrate');
      V.celebrate = ce.length === 3 && ce[0].layerOf === 'commit' && ce[0].layer && !ce[1].layer && ce[1].played && ce[2].layerOf === 'save' && ce[2].layer;
      const f = h.foley;
      V.foleyUnder = !!(f.find((e) => e.event === 'move' && e.played) && f.find((e) => e.event === 'string' && e.played) && f.find((e) => e.event === 'next' && e.played) && f.find((e) => e.event === 'bow' && e.played && e.pan === 0.35));
      const lands = f.filter((e) => e.event === 'land');
      V.landLimit = lands.length === 4 && lands.slice(0, 3).every((e) => e.played) && lands[3].dropped === 'rate' && lands[0].pan === -0.35 && lands[1].pan === 0 && lands[2].pan === 0.35;
      V.reducedFoley = h.reduced.filter((e) => e.event === 'land' || e.event === 'string').every((e) => e.dropped === 'reduced') && h.reduced.some((e) => e.event === 'wake' && e.played && e.kit === 'nier');
      V.nameClimb = h.name.length === 9 && h.name.every((e, i) => e.played && e.step === i + 1);
      V.show = h.show.length === 3 && h.show[0].event === 'showPointer' && h.show[0].asked === 'pointer' && h.show[1].event === 'showInterrupt' && h.show[2].event === 'pointer';
      const ts = h.tour.filter((e) => e.event === 'chapter'), fin = h.tour.find((e) => e.event === 'finish');
      V.tourRun = ts.map((e) => e.depth).join(',') === '1,2' && !!(fin && fin.deferred === 150 && fin.played) && h.tour.some((e) => e.event === 'rest');
      report.live.heroVerdict = V;
    }
    /* mute stops playback but keeps the trace; the binding stays a session preview without a Project */
    await page.evaluate(() => window.O55.sound.setMuted(true, 'check'));
    report.live.afterMute = await page.evaluate(() => { const S = window.O55.sound; S.play('select'); const e = S.log[S.log.length - 1]; return { muted: S.muted, last: e, binding: S.binding() }; });
    await page.goto(pathToFileURL(pageFile).href + '?o55=off');
    await sleep(1200);
    report.live.afterReload = await page.evaluate(() => ({ muted: window.O55.sound.muted, binding: window.O55.sound.binding(), legacyStored: localStorage.getItem('pm.o55.sound') }));
  }
  report.errors = page.errors;
} finally { await close(); }
writeFileSync(join(out, 'sound.json'), JSON.stringify(report, null, 1));
const silent = [], loud = [];
for (const [k, m] of Object.entries(report.renders)) for (const [e, vs] of Object.entries(m)) vs.forEach((r, i) => { if (!r || r.peak < 0.003) silent.push(`${k}:${e}:${i + 1}`); else if (r.peak >= 0.9) loud.push(`${k}:${e}:${i + 1}`); });
console.log(JSON.stringify({ out, renders: Object.values(report.renders).reduce((a, m) => a + Object.values(m).reduce((b, v) => b + v.length, 0), 0), silent, loud, catalog: report.catalog && { entries: report.catalog.entries, bad: report.catalog.bad.length, styles: report.catalog.styles }, live: report.live, errors: report.errors }, null, 1));
