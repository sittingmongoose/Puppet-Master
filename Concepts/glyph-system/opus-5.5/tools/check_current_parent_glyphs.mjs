// Test-only N1–N4 adapter. Product sources, frozen driver, and artifact bytes are never written.
// Recording uses only the installed agent-browser helper and its normal global admission.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const arg = (name, fallback = null) => { const i = argv.indexOf(name); return i < 0 ? fallback : argv[i + 1]; };
const mode = arg('--mode', 'admission');
const pagePath = resolve(arg('--page'));
const driverPath = resolve(arg('--driver'));
const out = resolve(arg('--out'));
const candidateHead = arg('--candidate-head');
const worktreeHead = arg('--worktree-head', candidateHead);
const sha = (data) => createHash('sha256').update(data).digest('hex');
const pageSha = sha(readFileSync(pagePath));
if (pageSha !== arg('--page-sha256')) throw new Error('HOLD: current page hash does not match the bound artifact');
const driver = readFileSync(driverPath, 'utf8');
if (sha(driver) !== '2d2ed65deadf51b2d4ff1e53551cc37b9b77c85100319f14c9b0a56100180041') {
  throw new Error('HOLD: frozen pill_check.mjs bytes changed');
}
const scanStart = driver.indexOf('function scanScopes(R) {');
const scanEnd = driver.indexOf('\n}\n', scanStart) + 2;
if (scanStart < 0 || scanEnd < scanStart) throw new Error('HOLD: cannot locate the original self-contained collector');
const collectorSource = driver.slice(scanStart, scanEnd);
const collector = Function('return (' + collectorSource + ')')();
if (collector.toString() !== collectorSource) throw new Error('HOLD: collector serialization changed');
const oldScope = "el.closest('#o55-resume,.o55-demo')";
const newScope = "el.closest('#o55-resume,.o55-demo,#o55-tourchip')";
const oldRoots = "['#o55-resume', '.o55-demo']";
const newRoots = "['#o55-resume', '.o55-demo', '#o55-tourchip']";
for (const site of [oldScope, oldRoots]) {
  if (collectorSource.split(site).length !== 2) throw new Error('HOLD: supplementary collector site is not unique');
}
const companionSource = collectorSource.replace(oldScope, newScope).replace(oldRoots, newRoots);
const inverseSource = companionSource.replace(newScope, oldScope).replace(newRoots, oldRoots);
if (inverseSource !== collectorSource) throw new Error('HOLD: supplementary collector changes more than its two authorized selector sites');
const companion = Function('return (' + companionSource + ')')();
if (companion.toString() !== companionSource) throw new Error('HOLD: supplementary collector serialization changed');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'helper-source.mjs'), readFileSync(new URL(import.meta.url)));
writeFileSync(join(out, 'collector-original.js'), collectorSource);
writeFileSync(join(out, 'collector-tourchip.js'), companionSource);
const result = {
  schema_version: 1, mode, started_utc: new Date().toISOString(), status: 'RUNNING',
  candidate_source_head: candidateHead, worktree_head_at_run: worktreeHead,
  page_sha256: pageSha, page_bytes: readFileSync(pagePath).length,
  helper_sha256: sha(readFileSync(new URL(import.meta.url))),
  frozen_driver_sha256: sha(driver), collector_sha256: sha(collectorSource),
  collector_bytes: Buffer.byteLength(collectorSource), collector_verbatim: true,
  collector_scope_gap: '#o55-tourchip is absent from the frozen scopeOf and rootsFor selectors; eligibility is unchanged.',
  supplementary_collector: { label: 'supplementary floaters/tourchip', sha256: sha(companionSource),
    inverse_projection_sha256: sha(inverseSource), inverse_byte_equal_original: true,
    exact_two_sites: [{ original: oldScope, supplementary: newScope }, { original: oldRoots, supplementary: newRoots }] },
  errors: [], actions: [], cases: [],
  sampling_limitations: 'Functional sampling only. Hardware video is not frame-perfect and this is not exclusive FPS/performance certification.',
};
const save = () => writeFileSync(join(out, 'result.json'), JSON.stringify(result, null, 2) + '\n');
function command(args, tool = 'agent-browser') {
  const r = spawnSync(tool, args, { encoding: 'utf8', timeout: 60000, maxBuffer: 4 * 1024 * 1024 });
  const record = { argv: [tool, ...args], exit_code: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error?.message || null };
  result.helper_commands ||= []; result.helper_commands.push(record); save();
  if (r.status !== 0 || r.error) throw new Error('HOLD: normal helper failed: ' + JSON.stringify(record));
  return JSON.parse(r.stdout);
}
let session = null, browser = null, extraRecording = null;
function stopOwned() {
  if (extraRecording) {
    result.extra_recording_stop_receipt = command(['stop', extraRecording.id], 'agent-record');
    extraRecording = null;
  }
  if (!session) return;
  const id = session.id;
  result.stop_receipt = command(['stop', id]);
  session = null;
  save();
}
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.once(signal, () => {
  result.status = 'HOLD'; result.errors.push('Interrupted: ' + signal); save();
  try { stopOwned(); } catch (e) { result.errors.push(String(e)); save(); }
  process.exit(130);
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function setLook(page, look, reduced = false) {
  const [family, themeMode] = look.split('-');
  await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await page.evaluate(([f, m]) => {
    const cap = (s) => s[0].toUpperCase() + s.slice(1);
    window.PM12_KIMI.setSettingFromHost('general.visual.theme', cap(f === 'nier' ? 'basic' : f) + ' ' + cap(m));
    window.PM_NIER.set(f === 'nier');
  }, [family, themeMode]);
  await page.waitForFunction(([f, m]) => document.documentElement.dataset.theme === (f === 'nier' ? 'basic' : f) + '-' + m &&
    (document.documentElement.getAttribute('data-o55-nier') === 'on') === (f === 'nier'), [family, themeMode], { timeout: 10000 });
  await sleep(family === 'nier' ? 2000 : 800);
  return page.evaluate(() => ({ theme: document.documentElement.dataset.theme, nier: document.documentElement.getAttribute('data-o55-nier'),
    reduced_media: matchMedia('(prefers-reduced-motion: reduce)').matches, motion: document.documentElement.getAttribute('data-motion') }));
}
async function admission(page, narrow = false) {
  result.environment = await page.evaluate(() => {
    const g = document.createElement('canvas').getContext('webgl');
    const x = g?.getExtension('WEBGL_debug_renderer_info');
    const renderer = x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : 'none';
    g?.getExtension('WEBGL_lose_context')?.loseContext();
    return { renderer, viewport: { width: innerWidth, height: innerHeight }, DPR: devicePixelRatio, user_agent: navigator.userAgent };
  });
  if (!/Quadro P1000/.test(result.environment.renderer) || /SwiftShader|llvmpipe/i.test(result.environment.renderer)) {
    throw new Error('HOLD: hardware renderer unavailable: ' + result.environment.renderer);
  }
  if (result.environment.viewport.width !== (narrow ? 700 : 1920) || result.environment.viewport.height !== (narrow ? 900 : 1080) || result.environment.DPR !== 1) {
    throw new Error('HOLD: unexpected normal recording viewport/DPR: ' + JSON.stringify(result.environment));
  }
  await page.goto(pathToFileURL(pagePath).href + '?o55=off', { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.PM12_KIMI && window.PM7_SETTINGS_TOME && window.PM7_USAGE && window.O55 && window.PMH && window.toast,
    null, { timeout: 120000 });
  await setLook(page, 'glass-dark');
  await page.screenshot({ path: join(out, 'admission-glass-dark.png') });
  if (narrow) return;
  result.visible_state = await page.evaluate(() => ({
    pages: [...document.querySelectorAll('[data-page]')].slice(0, 20).map((e) => ({ tag: e.tagName, page: e.dataset.page, text: e.textContent.trim().slice(0, 70), role: e.getAttribute('role'), tabIndex: e.tabIndex })),
    toast_methods: Object.keys(window.toast),
    floater_glyphs: [...document.querySelectorAll('#o55-resume svg.nx,#o55-tourchip svg.nx,.o55-demopill svg.nx')].map((e) => ({ host: e.closest('[id]')?.id, glyph: e.dataset.nx })),
  }));
  if (mode !== 'admission' && mode !== 'n1') return;
  await page.evaluate(() => window.PM_PAGES.go('usage'));
  await sleep(3000);
  result.bridge_targets = await page.evaluate(() => [...document.querySelectorAll('[data-pmh-kind]')].flatMap((e) => {
    const gs = [...e.querySelectorAll(':scope > svg.nx:not(.nx-self), :scope > :not(button,summary,[role="button"],[data-action]) > svg.nx:not(.nx-self)')];
    const r = e.getBoundingClientRect();
    if (!gs.length || r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > innerHeight) return [];
    return [{ tag: e.tagName, cls: e.className, widget: e.dataset.widget, pmh_kind: e.dataset.pmhKind,
      rect: { x: r.x, y: r.y, w: r.width, h: r.height }, glyphs: gs.map((g) => ({ name: g.dataset.nx, classes: g.getAttribute('class') })),
      menu_buttons: [...e.querySelectorAll('button')].map((b) => ({ text: b.textContent.trim().slice(0, 40), label: b.getAttribute('aria-label'), action: b.dataset.action })) }];
  }));
  await page.screenshot({ path: join(out, 'admission-usage-targets.png') });
  await sleep(1500);
}
async function n1(page) {
  const pointer = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.pmu-card')];
    const card = cards.find((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 100 && r.height > 100 && r.top > 100 && r.bottom < innerHeight && e.querySelector('svg.nx');
    });
    if (!card) return null;
    const r = card.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, widget: card.dataset.widget };
  });
  if (!pointer) throw new Error('HOLD: no visible glyph-bearing Usage card for exact N1 target discovery');
  await page.evaluate(() => {
    window.__pmgTrustedInput = [];
    for (const type of ['pointermove', 'pointerdown', 'pointerup', 'click', 'keydown']) {
      document.addEventListener(type, (e) => window.__pmgTrustedInput.push({ type, trusted: e.isTrusted,
        at: performance.now(), utc_ms: Date.now(), x: e.clientX ?? null, y: e.clientY ?? null, key: e.key ?? null }), { capture: true, passive: true });
    }
  });
  await page.mouse.move(5, 5);
  await page.mouse.move(pointer.x, pointer.y);
  await sleep(1300);
  const discovery = await page.evaluate(() => {
    const visible = (e) => {
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && cs.display !== 'none' && cs.visibility !== 'hidden';
    };
    const hosts = [...document.querySelectorAll('[data-pmh-kind]')].filter(visible);
    const gs = (e) => [...e.querySelectorAll(':scope > svg.nx:not(.nx-self), :scope > :not(button,summary,[role="button"],[data-action]) > svg.nx:not(.nx-self)')];
    return {
      eligible_hosts: hosts.filter((e) => gs(e).length).map((e) => ({ id: e.id, cls: e.className, widget: e.dataset.widget, glyphs: gs(e).map((g) => g.dataset.nx) })),
      visible_enrolled_host_count: hosts.length,
      enrolled_hosts_with_deeper_glyphs: hosts.filter((e) => e.querySelector('svg.nx')).map((e) => ({ id: e.id, cls: e.className, widget: e.dataset.widget,
        glyphs: [...e.querySelectorAll('svg.nx')].map((g) => {
          let depth = 0, n = g; while (n && n !== e) { depth++; n = n.parentElement; }
          const cs = getComputedStyle(g);
          return { glyph: g.dataset.nx, depth, classes: g.getAttribute('class'), parent: g.parentElement.tagName,
            own_button_host: !!g.closest('button,summary,[role="button"],[data-action]'), halo_alpha: cs.getPropertyValue('--nx-hi-a'), ink: cs.stroke };
        }) })),
      PMH_state: window.PMH.state(), input: window.__pmgTrustedInput,
      root_transition: document.documentElement.getAttribute('data-pm-page-transition'),
      moments: [...document.querySelectorAll('[data-pmu-moment]')].map((e) => ({ id: e.id, value: e.getAttribute('data-pmu-moment') })),
    };
  });
  result.N1_discovery = { look: 'glass-dark', reduced: false, pointer, ...discovery };
  await page.screenshot({ path: join(out, 'n1-trusted-pointer-exact-bridge-targets.png') });
  if (!discovery.eligible_hosts.length) {
    result.cases.push({ id: 'N1-target-discovery', status: 'UNVERIFIED', reason: 'No visible enrolled PMH target has an svg.nx at the exact bridge child/grandchild selector depth. Deeper glyphs are recorded without expanding the bridge or changing geometry.',
      remaining: 'All N1 a–c look/motion cases require an eligible source-specified target; no card glyph ignite acceptance claimed.' });
    result.status = 'UNVERIFIED';
    return;
  }
  throw new Error('HOLD: eligible N1 targets discovered; full interaction adapter not yet implemented');
}
const TEN_LOOKS = ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light', 'nier-dark', 'nier-light'];
const TOAST_KINDS = ['info', 'warn', 'error', 'success'];
const CHIP_RULE = ':is(#o55-resume, #o55-tourchip) svg.nx:not([class*="nx-t-"])';
const NARROW_RULE = 'html[data-theme="glass-light"] .o55-demo[data-o55-narrow] .o55-demopill > svg.nx.o55-sg';
async function ruleScopeProof(page, id, fields = {}) {
  const proof = await page.evaluate(([chip, narrow]) => {
    const describe = (g) => ({ glyph: g.dataset.nx, cls: g.getAttribute('class'), parent: g.parentElement.tagName,
      host: g.closest('#o55-resume,#o55-tourchip,#o55-demo')?.id, rect: g.getBoundingClientRect().toJSON() });
    const first = [...document.querySelectorAll(chip)], second = [...document.querySelectorAll(narrow)];
    const expectedNarrow = document.documentElement.dataset.theme === 'glass-light' &&
      !!document.querySelector('.o55-demo[data-o55-narrow]');
    return { utc_ms: Date.now(), at: performance.now(), theme: document.documentElement.dataset.theme,
      nier: document.documentElement.getAttribute('data-o55-nier'),
      window_layout: document.querySelector('#pm-o55-onboarding')?.getAttribute('data-o55-layout'),
      narrow: !!document.querySelector('.o55-demo[data-o55-narrow]'), first: first.map(describe), second: second.map(describe),
      first_scope_exact: first.every((g) => !!g.closest('#o55-resume,#o55-tourchip') && !/nx-t-/.test(g.getAttribute('class'))),
      second_scope_exact: second.length === (expectedNarrow ? 1 : 0) && second.every((g) =>
        g.parentElement.matches('.o55-demopill') && g.closest('#o55-demo') && g.dataset.nx === 'sparkles'),
      other_UI_matches: [...document.querySelectorAll(chip + ',' + narrow)].filter((g) =>
        !g.closest('#o55-resume,#o55-tourchip,#o55-demo')).map(describe),
      present_other_UI_glyph_counts: Object.fromEntries(['#pm-o55-onboarding','#pm-o55-tour','.pmu-card',
        '#panel-testing','#panel-source','#panel-search','#rsStage','#rsStack','#settings-pane'].map((s) =>
        [s, document.querySelectorAll(s + ' svg.nx').length])) };
  }, [CHIP_RULE, NARROW_RULE]);
  const row = { id, requirement: 'source816-selector-scope', ...fields, selectors: [CHIP_RULE, NARROW_RULE], ...proof,
    status: proof.first_scope_exact && proof.second_scope_exact && !proof.other_UI_matches.length ? 'PASS' : 'HOLD' };
  result.scope_proofs ||= []; result.scope_proofs.push(row); save();
  if (row.status !== 'PASS') throw new Error('HOLD: approved rule scope mismatch: ' + JSON.stringify(row));
  return row;
}
function contrastMethod() {
  // Reuse the source owner's accepted field measurement, not the old campaign or its state setup.
  const text = readFileSync(resolve(arg('--contrast-source')), 'utf8');
  const marker = 'const MEASURE = ';
  const start = text.indexOf(marker);
  const end = text.indexOf('\n};\n', start) + 2;
  if (start < 0 || end < start) throw new Error('HOLD: cannot locate source-owner contrast function');
  const original = text.slice(start + marker.length, end);
  const measure = Function('return (' + original + ')')();
  if (measure.toString() !== original) throw new Error('HOLD: source contrast function serialization changed');
  result.contrast_method = { source_sha256: sha(text), function_sha256: sha(original), verbatim: true,
    method: 'Effective computed glyph ink/opacity over median and 10th/90th-percentile actual behind-field pixels from a screenshot with glyphs hidden; rendered foreground screenshot and hardware frames support this measurement.' };
  writeFileSync(join(out, 'contrast-method.js'), original);
  return measure;
}
async function glyphMetadata(page, selector) {
  return page.evaluate((sel) => [...document.querySelectorAll(sel)].flatMap((svg, i) => {
    const r = svg.getBoundingClientRect();
    let op = 1;
    for (let n = svg; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n); op *= Number(cs.opacity);
      if (cs.visibility === 'hidden' || cs.display === 'none') op = 0;
    }
    if (op < 0.05 || !r.width || r.bottom <= 0 || r.top >= innerHeight) return [];
    const cs = getComputedStyle(svg), button = svg.closest('button'), card = svg.closest('.n-card,#o55-resume,#o55-tourchip,.o55-demopill');
    const br = button?.getBoundingClientRect(), cr = card?.getBoundingClientRect(), cc = card && getComputedStyle(card);
    const clips = [];
    for (let p = svg.parentElement; p && p !== document.body; p = p.parentElement) {
      const pc = getComputedStyle(p);
      if (/(hidden|clip|auto|scroll)/.test(pc.overflowX + pc.overflowY)) {
        const pr = p.getBoundingClientRect();
        clips.push({ tag: p.tagName, id: p.id, cls: p.className, overflow: [pc.overflowX, pc.overflowY], radius: pc.borderRadius,
          rect: { x: pr.x, y: pr.y, w: pr.width, h: pr.height } });
      }
    }
    return [{ index: i, x: r.x, y: r.y, w: r.width, h: r.height, ink: cs.stroke, op,
      glyph: svg.dataset.nx, key: svg.closest('.nx-st')?.dataset.k || svg.dataset.nx,
      title: svg.closest('.n-card')?.querySelector('.n-title')?.textContent || null,
      where: svg.closest('#rsStage,#rsStack,#o55-resume,#o55-tourchip,.o55-demo')?.id,
      halo_alpha: cs.getPropertyValue('--nx-hi-a'), halo_width: cs.getPropertyValue('--nx-hi-w'),
      button: br && { x: br.x, y: br.y, w: br.width, h: br.height },
      card: cr && { x: cr.x, y: cr.y, w: cr.width, h: cr.height, radius: cc.borderRadius }, clips }];
  }), selector);
}
async function measureGlyphs(page, measure, id, selector, fields = {}) {
  const began = await page.evaluate(() => ({ utc_ms: Date.now(), at: performance.now() }));
  const rects = await glyphMetadata(page, selector);
  if (!rects.length) throw new Error('UNVERIFIED: required visible glyph state missing: ' + id);
  const viewport = await page.evaluate(() => ({ w: innerWidth, h: innerHeight, dpr: devicePixelRatio }));
  const clip = { x: Math.max(0, Math.floor(Math.min(...rects.map((r) => r.x)) - 8)),
    y: Math.max(0, Math.floor(Math.min(...rects.map((r) => r.y)) - 8)) };
  clip.width = Math.min(viewport.w - clip.x, Math.ceil(Math.max(...rects.map((r) => r.x + r.w)) + 8) - clip.x);
  clip.height = Math.min(viewport.h - clip.y, Math.ceil(Math.max(...rects.map((r) => r.y + r.h)) + 8) - clip.y);
  const foregroundCrop = await page.screenshot({ path: join(out, id + '--foreground.png'), clip });
  await page.evaluate((sel) => {
    window.__pmgHidden = [...new Set([...document.querySelectorAll(sel)].map((e) => e.closest('.nx-st') || e))]
      .map((e) => ({ e, value: e.style.getPropertyValue('opacity'), priority: e.style.getPropertyPriority('opacity') }));
    for (const r of window.__pmgHidden) r.e.style.setProperty('opacity', '0', 'important');
  }, selector);
  let behindCrop;
  try { behindCrop = await page.screenshot({ path: join(out, id + '--behind.png'), clip }); }
  finally {
    await page.evaluate(() => {
      for (const r of window.__pmgHidden || []) {
        if (r.value) r.e.style.setProperty('opacity', r.value, r.priority); else r.e.style.removeProperty('opacity');
      }
      delete window.__pmgHidden;
    });
  }
  const after = await glyphMetadata(page, selector);
  // Place the captured crop at its original device-pixel coordinates in a transparent viewport canvas.
  // Every sampled behind-field pixel remains the captured pixel; the unchanged owner function receives its
  // original full-viewport coordinate system. No DOM, source geometry, classification or contrast rule changes.
  const [foreground, behind] = await page.evaluate(async ([fg, bg, c, vp]) => {
    const expand = async (encoded) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + encoded; await img.decode();
      const canvas = document.createElement('canvas'); canvas.width = vp.w * vp.dpr; canvas.height = vp.h * vp.dpr;
      canvas.getContext('2d').drawImage(img, c.x * vp.dpr, c.y * vp.dpr);
      return canvas.toDataURL('image/png').split(',')[1];
    };
    return [await expand(fg), await expand(bg)];
  }, [foregroundCrop.toString('base64'), behindCrop.toString('base64'), clip, viewport]);
  const measured = await page.evaluate(measure, [behind, rects]);
  const peak = await page.evaluate(async ([fg, bg, rows]) => {
    const load = async (s) => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode();
      const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(i, 0, 0); return { g, w: c.width, h: c.height }; };
    const a = await load(fg), b = await load(bg), scale = a.w / innerWidth;
    const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const lum = (r, g, bb) => .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(bb);
    return rows.map((r) => {
      const x = Math.max(0, Math.floor(r.x * scale)), y = Math.max(0, Math.floor(r.y * scale));
      const w = Math.min(a.w - x, Math.ceil(r.w * scale)), h = Math.min(a.h - y, Math.ceil(r.h * scale));
      const p = a.g.getImageData(x, y, w, h).data, q = b.g.getImageData(x, y, w, h).data;
      const ratios = [], samples = [];
      for (let i = 0; i < p.length; i += 4) {
        const d = Math.max(...[0, 1, 2].map((j) => Math.abs(p[i + j] - q[i + j])));
        if (d < 4) continue;
        const l1 = lum(p[i], p[i + 1], p[i + 2]), l2 = lum(q[i], q[i + 1], q[i + 2]);
        const ratio = (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05);
        ratios.push(ratio); samples.push({ delta: d, ratio, fg: [p[i], p[i + 1], p[i + 2]], behind: [q[i], q[i + 1], q[i + 2]] });
      }
      ratios.sort((x2, y2) => x2 - y2); samples.sort((x2, y2) => y2.delta - x2.delta);
      return { glyph: r.glyph, changed_pixels: ratios.length, observed_pixel_max_contrast: ratios.at(-1) ?? null,
        observed_pixel_p90_contrast: ratios[Math.floor(ratios.length * .9)] ?? null,
        five_largest_delta_samples: samples.slice(0, 5), note: 'Foreground pairs include antialiasing and halos; observed peak supports, and does not replace, the source-owner effective-core contrast gate.' };
    });
  }, [foreground, behind, rects]);
  const sameRects = rects.length === after.length && rects.every((r, i) => r.glyph === after[i].glyph && r.title === after[i].title &&
    ['x', 'y', 'w', 'h'].every((k) => Math.abs(r[k] - after[i][k]) < 0.1));
  const gate = measured.every((r) => r.ratio >= 3 && r.worst >= 3);
  const support = peak.every((r) => r.observed_pixel_max_contrast >= 3);
  const row = { id, ...fields, began, ended: await page.evaluate(() => ({ utc_ms: Date.now(), at: performance.now() })),
    actual_glyphs: rects, after_glyphs: after, pixel_capture_clip: clip, pixel_capture_viewport: viewport,
    hidden_without_layout_shift: sameRects, measured, foreground_pixel_support: peak,
    contrast_status: !sameRects ? 'UNVERIFIED' : !gate ? 'HOLD' : !support ? 'UNVERIFIED' : 'MEASURED',
    visual_status: 'PENDING_FRAME_REVIEW' };
  result.cases.push(row); save();
  console.log(JSON.stringify({ id, contrast_status: row.contrast_status, glyphs: measured.map((r) => ({ key: r.key, ratio: r.ratio, worst: r.worst })) }));
  return row;
}
async function collectPills(page, id, fields, scopes = ['shell', 'floaters']) {
  const original = await page.evaluate(collector, { scopes });
  const supplementary = await page.evaluate(companion, { scopes: ['floaters'] });
  const row = { id, ...fields, original_gate: { label: 'original ' + scopes.join(','), ...original },
    supplementary_gate: { label: 'supplementary floaters/tourchip', ...supplementary },
    original_coverage_limitation_retained: true,
    status: original.findings.length || supplementary.findings.length ? 'HOLD' : 'PASS' };
  result.cases.push(row); save(); return row;
}
async function trustedInputs(page) {
  await page.evaluate(() => {
    if (window.__pmgInputInstalled) return;
    window.__pmgInputInstalled = true; window.__pmgInputs = [];
    for (const type of ['pointermove', 'pointerdown', 'pointerup', 'click', 'keydown', 'keyup', 'focusin', 'focusout']) {
      document.addEventListener(type, (e) => window.__pmgInputs.push({ type, trusted: e.isTrusted, at: performance.now(), utc_ms: Date.now(),
        x: e.clientX ?? null, y: e.clientY ?? null, key: e.key ?? null,
        target: { tag: e.target.tagName, id: e.target.id, cls: e.target.getAttribute?.('class'), tool: e.target.closest?.('[data-tool]')?.dataset.tool } }), { capture: true, passive: true });
    }
  });
}
function nativeSample(selectors) {
  const visible = (e) => {
    const r = e.getBoundingClientRect(); let op = 1;
    for (let n = e; n?.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return false; op *= Number(cs.opacity);
    }
    return op > .05 && r.width > 0 && r.height > 0 && r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight;
  };
  return { at: performance.now(), utc_ms: Date.now(), transition: document.documentElement.getAttribute('data-pm-page-transition'),
    moments: [...document.querySelectorAll('[data-pmu-moment]')].map((e) => ({ id: e.id, value: e.getAttribute('data-pmu-moment') })),
    PMH_state: window.PMH?.state(), menus: [...document.querySelectorAll('.pmu-menu,.pmu-pop,[role="menu"]')].filter(visible).map((e) => ({ cls: e.className, state: e.getAttribute('data-mstate') })),
    glyphs: [...document.querySelectorAll(selectors)].map((svg) => {
      const cs = getComputedStyle(svg), h = svg.querySelector('.nx-h'), hc = h && getComputedStyle(h), host = svg.closest('button,summary,[role="button"],[data-action]');
      const r = svg.getBoundingClientRect();
      return { glyph: svg.dataset.nx, cls: svg.getAttribute('class'), visible: visible(svg), rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        host: host && { tag: host.tagName, cls: host.className, tool: host.dataset.tool, hover: host.matches(':hover'), focus_visible: host.matches(':focus-visible'), focus: document.activeElement === host },
        card: svg.closest('.pmu-card')?.className, ink: cs.stroke, halo_alpha: cs.getPropertyValue('--nx-hi-a').trim(), halo_visibility: hc?.visibility,
        halo_stroke_opacity: hc?.strokeOpacity, halo_opacity: hc?.opacity, act: cs.getPropertyValue('--nx-1').trim(), flick: cs.getPropertyValue('--nx-fl').trim(),
        moving_parts: [...svg.querySelectorAll('.nx-p')].map((p) => ({ cls: p.getAttribute('class'), transform: getComputedStyle(p).transform, opacity: getComputedStyle(p).opacity })),
        animations: svg.getAnimations({ subtree: true }).map((a) => ({ name: a.animationName || a.id, play_state: a.playState, current_time: a.currentTime, duration: a.effect?.getComputedTiming().duration })) };
    }) };
}
async function beginNativeTrace(page, selectors, label) {
  await page.evaluate(([source, sel, name]) => {
    const sample = Function('return (' + source + ')')();
    window.__pmgTrace = { label: name, selectors: sel, rows: [], stop: false };
    const next = () => { const t = window.__pmgTrace; if (t.stop) return; t.rows.push(sample(t.selectors)); t.raf = requestAnimationFrame(next); };
    next();
  }, [nativeSample.toString(), selectors, label]);
}
async function endNativeTrace(page) {
  return page.evaluate(() => { const t = window.__pmgTrace; t.stop = true; cancelAnimationFrame(t.raf); delete window.__pmgTrace; return { label: t.label, selectors: t.selectors, rows: t.rows }; });
}
async function nativeHover(page, id, host, selectors, fields) {
  await page.mouse.move(1850, 1000); await sleep(600);
  const rest = await page.evaluate(nativeSample, selectors);
  await beginNativeTrace(page, selectors, id);
  if (fields.requirement === 'R1-native-control-hover-under-PMH-rests') {
    const header = await page.locator(host).evaluate((e) => e.closest('.pmu-card').querySelector('.pmu-cardhead').getBoundingClientRect().toJSON());
    await page.mouse.move(header.x + header.width / 2, header.y + header.height / 2); await sleep(500);
  }
  await page.locator(host).hover(); await sleep(900);
  const hover = await page.evaluate(nativeSample, selectors);
  await page.screenshot({ path: join(out, id + '--hover.png') });
  await page.mouse.move(1850, 1000); await sleep(900);
  const left = await page.evaluate(nativeSample, selectors);
  const trace = await endNativeTrace(page);
  const noStuck = left.glyphs.every((g, i) => !g.host?.hover && !g.host?.focus_visible && g.halo_alpha === rest.glyphs[i]?.halo_alpha && g.ink === rest.glyphs[i]?.ink);
  const row = { id, ...fields, rest, hover, left, trace, no_stuck_native_paint_after_leave: noStuck, status: noStuck ? 'MEASURED_PENDING_FRAME_REVIEW' : 'HOLD' };
  result.cases.push(row); save(); return row;
}
async function floaterFixture(page) {
  await trustedInputs(page);
  await page.evaluate(() => window.PM_PAGES.go('dashboard'));
  // One first safe tour step creates its own valid durable checkpoint and snapshot. It is fixture setup,
  // not a tour walk, and no checkpoint, predicate or source state is fabricated.
  await page.evaluate(() => window.PM7_GUIDED_TOUR.start({ fresh: true }));
  await page.waitForFunction(() => window.O55.store.get('tour', null)?.status === 'running', null, { timeout: 30000 });
  const checkpoint = await page.evaluate(() => ({ saved: window.O55.store.get('tour', null), resumable: window.PM7_GUIDED_TOUR.resumable() }));
  if (!checkpoint.resumable) throw new Error('UNVERIFIED: actual first-step tour checkpoint is not resumable');
  result.floater_fixture = { tour: checkpoint, steps: ['published PM7_GUIDED_TOUR.start({fresh:true})', 'reload interrupts the actual saved first step', 'published O55.boot.tourChip()', 'published onboarding welcome open; trusted Close click'] };
  await page.reload({ waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.O55?.boot && window.PM_O55_ONBOARDING && window.PM7_GUIDED_TOUR, null, { timeout: 120000 });
  await trustedInputs(page);
  await page.evaluate(() => window.PM_O55_ONBOARDING.open({ screen: 'welcome' }));
  await page.locator('#pm-o55-onboarding .o55-close').click();
  await page.waitForFunction(() => !window.O55.S.open && document.querySelector('#o55-resume'), null, { timeout: 15000 });
  await page.evaluate(() => window.O55.boot.tourChip());
  await sleep(1000);
  result.floater_fixture.actual_state = await page.evaluate(() => ({ onboarding_status: window.O55.store.get('onboarding', null)?.status,
    tour_status: window.O55.store.get('tour', null)?.status, tour_resumable: window.PM7_GUIDED_TOUR.resumable(),
    glyphs: [...document.querySelectorAll('#o55-resume svg.nx,#o55-tourchip svg.nx,.o55-demopill svg.nx')].map((g) => ({ host: g.closest('[id]')?.id, glyph: g.dataset.nx })) }));
  await page.locator('#o55-tourchip [data-o55-chip="hide"]').click();
  save();
}
async function showFloater(page, which) {
  const other = which === 'resume' ? 'tourchip' : 'resume';
  if (await page.locator('#o55-' + other).count()) await page.locator('#o55-' + other + ' [data-o55-chip="hide"]').click();
  await page.evaluate((w) => w === 'resume' ? window.O55.boot.chip() : window.O55.boot.tourChip(), which);
  await page.locator('#o55-' + which).waitFor({ state: 'visible' });
  await sleep(300);
}
async function populatedPills(page, id, look, state, fixture, scopes = ['shell', 'floaters']) {
  await page.waitForFunction(() => !document.querySelector('#rsStage .n-card'), null, { timeout: 10000 });
  await page.evaluate(() => {
    window.toast.clear(); window.toast.collapse();
    for (const severity of ['info', 'warn', 'error', 'success']) window.toast.important({ title: 'Current-base ' + severity, body: 'Populated collector fixture.', severity }, { skipStage: true });
  });
  await sleep(700);
  await page.evaluate(() => window.toast.push({ title: 'Current-base stage', body: 'Populated collector fixture.', severity: 'info', important: false }));
  await sleep(250);
  const states = await page.evaluate(() => ({ stage: [...document.querySelectorAll('#rsStage .n-card')].map((e) => e.className),
    stack: [...document.querySelectorAll('#rsClip .n-card')].map((e) => e.className),
    resume: !!document.querySelector('#o55-resume'), tourchip: !!document.querySelector('#o55-tourchip'),
    demo: !!document.querySelector('.o55-demopill'), narrow: document.querySelector('#o55-demo')?.hasAttribute('data-o55-narrow') }));
  if (!states.stage.length || !states.stack.length) throw new Error('UNVERIFIED: pill collector fixture is not stage AND stack populated');
  const row = await collectPills(page, id, { requirement: 'N2/N3-pill', look, state, fixture, actual_states: states }, scopes);
  await page.screenshot({ path: join(out, id + '--populated.png') });
  return row;
}
async function n3(page) {
  const measure = contrastMethod();
  await floaterFixture(page);
  result.N3_resume_identity = { status: 'UNVERIFIED/HOLD', actual: 'history', review_expected: 'spark',
    source: '95-boot.js chip() calls O55.c.small(history, 14). Actual host measurements below do not discharge the spark identity criterion.' };
  const stopped = new Set(); let pillHold = false;
  for (const look of TEN_LOOKS) {
    const state = await setLook(page, look);
    for (const which of ['resume', 'tourchip', 'demo']) {
      if (which !== 'demo') await showFloater(page, which);
      const host = which === 'demo' ? '.o55-demopill' : '#o55-' + which + ' [data-o55-chip="resume"]';
      const selector = host + ' svg.nx';
      const requirement = which === 'resume' ? 'actual-published-resume-glyph' : 'N3';
      const prefix = which === 'resume' ? 'RESUME-ACTUAL-' : 'N3-';
      if (!stopped.has(which)) {
        await page.mouse.move(1850, 1000); await sleep(700);
        const rest = await measureGlyphs(page, measure, prefix + look + '-' + which + '-rest', selector,
          { requirement, look, state, host: which, pose: 'rest', actual_identity_only: which === 'resume' });
        if (rest.contrast_status !== 'MEASURED') stopped.add(which);
        else {
          const motion = await nativeHover(page, prefix + look + '-' + which + '-native-hover', host, selector, { requirement, look, state, host: which });
          await page.locator(host).hover(); await sleep(700);
          const hovered = await measureGlyphs(page, measure, prefix + look + '-' + which + '-hover', selector,
            { requirement, look, state, host: which, pose: 'hover', actual_identity_only: which === 'resume' });
          await page.mouse.move(1850, 1000);
          if (motion.status === 'HOLD' || hovered.contrast_status !== 'MEASURED') stopped.add(which);
        }
      }
      if (which !== 'demo' && !pillHold) {
        const pill = await populatedPills(page, 'PILL-' + look + '-' + which, look, state, which);
        if (pill.status === 'HOLD') pillHold = true;
      }
    }
    if (look === 'glass-dark') await page.screenshot({ path: join(out, 'N3-demo-two-magenta-marks-look-note.png') });
  }
  result.N3_stopped_hosts = [...stopped];
  result.N3_remaining = [...stopped].map((host) => ({ host, reason: 'Remaining contrast/hover poses stopped after the first HOLD or unverified measurement for this host; prior evidence retained.' }));
  result.N2_N3_original_pill_gate = pillHold ? 'HOLD; remaining populated collector cases stopped for owner' : 'PASS';
  result.N3 = 'UNVERIFIED/HOLD; resume identity mismatch; visual review and separately recorded actual narrow route required';
  result.inputs = await page.evaluate(() => window.__pmgInputs || []);
  result.status = 'HOLD';
}
async function n3Baseline(page) {
  const measure = contrastMethod(); await floaterFixture(page);
  const state = await setLook(page, 'basic-dark');
  result.baseline_scope = 'Only the two failed Basic Dark hover poses; original glyph26e page, no passed matrix or acceptance exemption.';
  for (const which of ['resume', 'tourchip']) {
    await showFloater(page, which);
    const host = '#o55-' + which + ' button[data-o55-chip="resume"]';
    await page.locator(host).hover(); await sleep(800);
    await measureGlyphs(page, measure, 'BASELINE-basic-dark-' + which + '-hover', host + ' > svg.nx',
      { requirement: 'minimal-original-glyph-baseline', host: which, look: 'basic-dark', state, pose: 'hover' });
    await page.mouse.move(1850, 1000);
  }
  result.status = 'BASELINE_REPRODUCTION_ONLY';
}
async function newBytePose(page, measure, id, host, selector, pose, fields, outside) {
  let focusRoute = null;
  await page.mouse.move(outside.x, outside.y);
  if (await page.locator(host).evaluate((e) => e.matches(':focus'))) await page.keyboard.press('Tab');
  await sleep(800);
  if (pose === 'rest') {
    const row = await measureGlyphs(page, measure, id, selector, { ...fields, pose });
    row.exact_zero_hide_layout_shift = row.actual_glyphs.length === row.after_glyphs.length && row.actual_glyphs.every((g, i) =>
      ['x', 'y', 'w', 'h'].every((k) => g[k] === row.after_glyphs[i][k])); save();
    if (row.contrast_status !== 'MEASURED' || !row.exact_zero_hide_layout_shift) throw new Error('HOLD: new-byte contrast/layout criterion failed: ' + id);
    return;
  }
  if (pose === 'focus-visible') {
    // Setup on the existing own button, then trusted Tab leaves it and Shift+Tab returns through browser navigation.
    // The trace begins after the setup focus has left; no focus class or geometry is forced.
    if (host === '.o55-demopill') {
      // The modal traps Tab inside its own window. The demo's published menu has its own ordinary Tab order,
      // so a trusted Shift+Tab from its first existing row reaches the demo button without crossing that trap.
      await page.locator(host).click();
      await page.locator('.o55-demomenu .o55-demoitem').first().focus();
      await page.mouse.move(outside.x, outside.y); await sleep(400);
      focusRoute = 'trusted demo-menu open, setup focus on its unchanged first row, trusted Shift+Tab to its own demo button; menu remains open during this focus pose';
    } else {
      await page.locator(host).focus(); await page.keyboard.press('Tab'); await sleep(400);
      focusRoute = 'existing own-button setup focus, trusted Tab, trace, trusted Shift+Tab return, trusted Tab leave';
    }
  }
  const before = await page.evaluate(nativeSample, selector);
  await beginNativeTrace(page, selector, id + '-native-act');
  if (pose === 'hover') await page.locator(host).hover(); else await page.keyboard.press('Shift+Tab');
  await sleep(1000);
  const active = await page.evaluate(nativeSample, selector);
  const reached = active.glyphs.length && active.glyphs.every((g) => pose === 'hover' ? g.host?.hover : g.host?.focus_visible);
  if (!reached) {
    result.cases.push({ id: id + '-native-route', ...fields, pose, before, active, trace: await endNativeTrace(page), focus_route: focusRoute, status: 'UNVERIFIED' });
    result.inputs = await page.evaluate(() => window.__pmgInputs || []); save();
    throw new Error('UNVERIFIED: trusted native route did not reach requested pose: ' + id);
  }
  await page.screenshot({ path: join(out, id + '--native-active.png') });
  const row = await measureGlyphs(page, measure, id, selector, { ...fields, pose });
  row.exact_zero_hide_layout_shift = row.actual_glyphs.length === row.after_glyphs.length && row.actual_glyphs.every((g, i) =>
    ['x', 'y', 'w', 'h'].every((k) => g[k] === row.after_glyphs[i][k]));
  if (pose === 'focus-visible') await page.keyboard.press('Tab');
  await page.mouse.move(outside.x, outside.y); await sleep(1000);
  const left = await page.evaluate(nativeSample, selector), trace = await endNativeTrace(page);
  // Concepts keep the halo element visible with zero stroke opacity at rest (neon-icons.css:120-125).
  // Compare the actual resting paint; the control-role visibility switch is not a concept-role criterion.
  const noStuck = left.glyphs.every((g, i) => !g.host?.hover && !g.host?.focus_visible &&
    ['ink', 'halo_alpha', 'halo_visibility', 'halo_stroke_opacity', 'halo_opacity'].every((k) => g[k] === before.glyphs[i]?.[k]) &&
    JSON.stringify(g.moving_parts) === JSON.stringify(before.glyphs[i]?.moving_parts));
  result.cases.push({ id: id + '-native-act', ...fields, pose, before, active, left, trace,
    focus_route: focusRoute,
    no_stuck_native_paint_after_leave_and_blur: noStuck,
    status: noStuck ? 'MEASURED_PENDING_FRAME_REVIEW' : 'HOLD' }); save();
  if (row.contrast_status !== 'MEASURED' || !row.exact_zero_hide_layout_shift || !noStuck) throw new Error('HOLD: new-byte contrast/layout/native criterion failed: ' + id);
  if (pose === 'focus-visible' && host === '.o55-demopill') await page.keyboard.press('Escape');
}
async function reducedNative(page, id, host, selector, fields, outside) {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await sleep(1000);
  await page.mouse.move(outside.x, outside.y);
  if (await page.locator(host).evaluate((e) => e.matches(':focus'))) await page.keyboard.press('Tab');
  const before = await page.evaluate(nativeSample, selector);
  await beginNativeTrace(page, selector, id);
  await page.locator(host).hover(); await sleep(1400);
  const active = await page.evaluate(nativeSample, selector);
  await page.screenshot({ path: join(out, id + '--lit-still.png') });
  const trace = await endNativeTrace(page);
  const late = trace.rows.filter((r) => r.at >= trace.rows.at(-1).at - 700);
  const shapes = new Set(late.map((r) => JSON.stringify(r.glyphs.map((g) => g.moving_parts))));
  // Frozen neon-icons.css says light looks carry "lit" by ink alone; dark looks carry their same-ink bloom.
  // These are supporting probes. Required hardware frames still decide whether the native lit pose is visible.
  const probeLit = active.glyphs.every((g, i) => g.visible && g.host?.hover &&
    ((g.halo_visibility === 'visible' && Number(g.halo_alpha) > 0) || g.ink !== before.glyphs[i]?.ink));
  const probeStill = shapes.size === 1 && late.every((r) => r.glyphs.every((g) => !g.animations.some((a) => a.play_state === 'running')));
  result.cases.push({ id, ...fields, reduced: true, before, active, trace, probe_lit: probeLit, probe_still: probeStill,
    status: probeLit && probeStill ? 'MEASURED_PENDING_FRAME_REVIEW' : 'UNVERIFIED' }); save();
  await page.mouse.move(outside.x, outside.y); await page.emulateMedia({ reducedMotion: 'no-preference' }); await sleep(800);
}
async function committedResumeFixture(page) {
  // This is one bounded fixture setup for the other published label, not a rerun of the onboarding matrix.
  // The published draft API supplies a valid local draft; a real Review/Create click produces the fixture receipt.
  await setLook(page, 'basic-dark');
  await page.evaluate(() => window.PM_O55_ONBOARDING.open({ fresh: true, screen: 'welcome' }));
  // open() schedules its real mount two animation frames later. Wait for that source lifecycle before editing
  // the newly mounted draft; editing the previous closed session would be discarded by the fresh mount.
  await page.waitForFunction(() => window.O55.S.open && window.O55.S.sess.screen === 'welcome' &&
    document.querySelector('#pm-o55-onboarding')?.getAttribute('data-open') === 'true', null, { timeout: 15000 });
  await page.evaluate(() => { window.O55.S.set({ project_name: 'Current glyph label fixture' }); window.O55.ui.go('review'); });
  const primary = '#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-primary';
  await page.waitForFunction((sel) => { const b = document.querySelector(sel); return b && !b.disabled &&
    b.getAttribute('aria-disabled') !== 'true' && b.getAttribute('data-o55-do') === 'commit'; }, primary, { timeout: 30000 });
  await page.locator(primary).click();
  await page.waitForFunction(() => ['done', 'failed'].includes(window.O55.S.sess.commit.state), null, { timeout: 30000 });
  const receipt = await page.evaluate(() => ({ commit: window.O55.S.sess.commit, draft: window.O55.draft.exportPlan(window.O55.S.sess.drafts.main) }));
  if (receipt.commit.state !== 'done') throw new Error('UNVERIFIED: supported local fixture did not produce the committed resume label');
  await page.locator('#pm-o55-onboarding .o55-close').click();
  await page.waitForFunction(() => !window.O55.S.open && document.querySelector('#o55-resume'), null, { timeout: 15000 });
  result.committed_resume_fixture = { route: 'published welcome open, O55.S.set valid local draft name, published go(review), trusted Create, terminal fixture receipt, trusted Close', receipt,
    saved: await page.evaluate(() => window.O55.store.get('onboarding', null)) }; save();
}
async function n3ChipsNew(page) {
  const measure = contrastMethod(); await floaterFixture(page);
  result.original_resume_spark_row = 'UNVERIFIED/HOLD; corrected N3-resume-history remains separate';
  const outside = { x: 1850, y: 1000 };
  for (const label of ['not-done', 'done']) {
    if (label === 'done') await committedResumeFixture(page);
    for (const look of TEN_LOOKS) {
      const state = await setLook(page, look);
      const hosts = label === 'done' ? ['resume'] : ['resume', 'tourchip'];
      for (const which of hosts) {
        await showFloater(page, which);
        const host = '#o55-' + which + ' button[data-o55-chip="resume"]', selector = host + ' > svg.nx';
        const binding = await page.locator(host).evaluate((b) => ({ text: b.textContent.trim(), svg: b.querySelector('svg.nx')?.dataset.nx,
          saved_status: window.O55.store.get('onboarding', null)?.status, commit_state: window.O55.store.get('onboarding', null)?.commit?.state }));
        if (binding.svg !== (which === 'resume' ? 'history' : 'sparkles') || (which === 'resume' &&
          (binding.saved_status !== 'closed' || (binding.commit_state === 'done') !== (label === 'done')))) throw new Error('HOLD: new chip source/state binding drift');
        const fields = { requirement: which === 'resume' ? 'N3-resume-history' : 'N3-tourchip-sparkles', look, state, host: which, resume_label: label, binding };
        await ruleScopeProof(page, 'SCOPE-wide-' + look + '-' + which + '-' + label, fields);
      }
      // The failed Basic Dark hover and never-run focus are measured before any rest or other-look acceptance.
      for (const pose of look === 'basic-dark' ? ['hover', 'focus-visible', 'rest'] : ['rest', 'hover', 'focus-visible']) {
        for (const which of hosts) {
          await showFloater(page, which);
          const host = '#o55-' + which + ' button[data-o55-chip="resume"]', selector = host + ' > svg.nx';
          await newBytePose(page, measure, 'NEW-CHIP-' + look + '-' + which + '-' + label + '-' + pose, host, selector, pose,
            { requirement: which === 'resume' ? 'N3-resume-history' : 'N3-tourchip-sparkles', look, state, host: which, resume_label: label }, outside);
        }
      }
      for (const which of hosts) {
        await showFloater(page, which);
        const host = '#o55-' + which + ' button[data-o55-chip="resume"]';
        if (look === 'glass-dark' && label === 'not-done') await reducedNative(page, 'NEW-CHIP-glass-dark-' + which + '-RM', host, host + ' > svg.nx',
          { requirement: which === 'resume' ? 'N3-resume-history' : 'N3-tourchip-sparkles', look, host: which, resume_label: label }, outside);
        const pill = await populatedPills(page, 'NEW-PILL-' + look + '-' + which + '-' + label, look, state, which, ['floaters']);
        if (pill.status !== 'PASS') throw new Error('HOLD: fresh affected floaters collector finding');
      }
    }
  }
  result.inputs = await page.evaluate(() => window.__pmgInputs || []);
  result.status = 'MEASURED_PENDING_FRAME_REVIEW_AND_OWNER_DARK_BLOOM_REVIEW';
}
async function n3PillsNew(page) {
  await floaterFixture(page);
  const completedPath = arg('--completed-new-pills');
  const completed = new Set(completedPath ? JSON.parse(readFileSync(completedPath, 'utf8')).passed_case_ids : []);
  result.previous_passed_pill_case_ids = [...completed];
  result.scope = 'Only missing affected original floaters and exact two-site supplementary collector; no contrast/hover acceptance after Basic Light HOLD';
  for (const label of ['not-done', 'done']) {
    if (arg('--only-new-pill-label') && arg('--only-new-pill-label') !== label) continue;
    if (label === 'done') await committedResumeFixture(page);
    for (const look of TEN_LOOKS) {
      const state = await setLook(page, look);
      for (const which of label === 'done' ? ['resume'] : ['resume', 'tourchip']) {
        await showFloater(page, which);
        const binding = await page.evaluate((w) => ({ saved: window.O55.store.get('onboarding', null)?.status,
          commit: window.O55.store.get('onboarding', null)?.commit?.state,
          label: document.querySelector('#o55-' + w + ' button[data-o55-chip="resume"]')?.textContent.trim() }), which);
        if (binding.saved !== 'closed' || (binding.commit === 'done') !== (label === 'done')) throw new Error('UNVERIFIED: pill fixture label/state mismatch');
        await ruleScopeProof(page, 'SCOPE-PILL-' + look + '-' + which + '-' + label, { look, state, host: which, resume_label: label, binding });
        const id = 'NEW-PILL-' + look + '-' + which + '-' + label;
        if (completed.has(id)) continue;
        const pill = await populatedPills(page, id, look, state, which, ['floaters']);
        pill.resume_label = label; pill.binding = binding; save();
        if (pill.status !== 'PASS') throw new Error('HOLD: missing affected floaters collector finding');
      }
    }
  }
  result.inputs = await page.evaluate(() => window.__pmgInputs || []);
  result.status = 'PILL_SCOPES_PASS; CHIP_CONTRAST_HOLD_UNCHANGED';
}
async function setOnboardingLook(page, look) {
  const [family, themeMode] = look.split('-'), wantedFamily = family === 'nier' ? 'basic' : family;
  const root = '#pm-o55-onboarding';
  const openMenu = async () => {
    if (!await page.locator(root + ' .o55-lookmenu').isVisible()) await page.locator(root + ' .o55-lookbtn').click();
  };
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openMenu();
  if (await page.evaluate(() => window.O55.nierLook.state().on)) {
    await page.locator(root + ' [data-o55-do="lookNier"]').click();
    await page.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-nier'), null, { timeout: 15000 });
    await sleep(1500); await openMenu();
  }
  await page.locator(root + ' [data-o55-do="lookFamily"][data-arg="' + wantedFamily + '"]').click();
  await openMenu();
  await page.locator(root + ' [data-o55-do="lookMode"][data-arg="' + themeMode + '"]').click();
  if (family === 'nier') {
    await openMenu(); await page.locator(root + ' [data-o55-do="lookNier"]').click();
  }
  await page.waitForFunction(([f, m, nier]) => document.documentElement.dataset.theme === f + '-' + m &&
    (document.documentElement.getAttribute('data-o55-nier') === 'on') === nier, [wantedFamily, themeMode, family === 'nier'], { timeout: 15000 });
  await sleep(family === 'nier' ? 2200 : 800);
  if (await page.locator(root + ' .o55-lookmenu').isVisible()) await page.locator(root + ' .o55-lookbtn').click();
  return page.evaluate(() => ({ theme: document.documentElement.dataset.theme, nier: document.documentElement.getAttribute('data-o55-nier'),
    reduced_media: matchMedia('(prefers-reduced-motion: reduce)').matches, route: 'trusted clicks through the published O55 header look menu' }));
}
async function n3Narrow(page) {
  const measure = contrastMethod(); await trustedInputs(page);
  let hold = false;
  for (const look of TEN_LOOKS) {
    const state = await setOnboardingLook(page, look);
    const actual = await page.evaluate(() => {
      const b = document.querySelector('.o55-demopill'), r = b.getBoundingClientRect(), s = b.querySelector('svg.nx');
      return { window_layout: document.querySelector('#pm-o55-onboarding')?.getAttribute('data-o55-layout'),
        narrow: document.querySelector('#o55-demo')?.hasAttribute('data-o55-narrow'),
        button: { x: r.x, y: r.y, w: r.width, h: r.height }, glyph: s?.dataset.nx, classes: s?.getAttribute('class') };
    });
    if (!actual.narrow || actual.window_layout !== 'narrow' || actual.button.w !== 20 || actual.button.h !== 44 || actual.glyph !== 'sparkles') {
      throw new Error('UNVERIFIED: supported O55 narrow route does not render the exact actual 20x44 sparkles tab: ' + JSON.stringify(actual));
    }
    await page.mouse.move(680, 870); await sleep(700);
    const rest = await measureGlyphs(page, measure, 'N3-NARROW-' + look + '-rest', '.o55-demopill > svg.nx',
      { requirement: 'N3-narrow', look, state, actual, pose: 'rest' });
    if (rest.contrast_status !== 'MEASURED') { hold = true; break; }
    // The leave coordinate is outside this separately admitted 700x900 viewport's tab, without resizing the recording.
    await beginNativeTrace(page, '.o55-demopill > svg.nx', 'N3-NARROW-' + look + '-native-hover');
    const before = await page.evaluate(nativeSample, '.o55-demopill > svg.nx');
    await page.locator('.o55-demopill').hover(); await sleep(900);
    const hovered = await page.evaluate(nativeSample, '.o55-demopill > svg.nx');
    const contrast = await measureGlyphs(page, measure, 'N3-NARROW-' + look + '-hover', '.o55-demopill > svg.nx',
      { requirement: 'N3-narrow', look, state, actual, pose: 'hover' });
    await page.mouse.move(680, 870); await sleep(900);
    const left = await page.evaluate(nativeSample, '.o55-demopill > svg.nx');
    const trace = await endNativeTrace(page);
    const noStuck = left.glyphs.every((g, i) => !g.host?.hover && !g.host?.focus_visible && g.halo_alpha === before.glyphs[i]?.halo_alpha && g.ink === before.glyphs[i]?.ink);
    result.cases.push({ id: 'N3-NARROW-' + look + '-native-hover', requirement: 'N3-narrow', look, state, actual, before, hover: hovered, left, trace,
      no_stuck_native_paint_after_leave: noStuck, status: noStuck ? 'MEASURED_PENDING_FRAME_REVIEW' : 'HOLD' }); save();
    if (!noStuck || contrast.contrast_status !== 'MEASURED') { hold = true; break; }
    const pill = await collectPills(page, 'PILL-NARROW-' + look, { requirement: 'N3-narrow-pill', look, state, actual }, ['floaters']);
    if (pill.status === 'HOLD') { hold = true; break; }
  }
  result.status = hold ? 'HOLD' : 'MEASURED_PENDING_FRAME_REVIEW';
  result.inputs = await page.evaluate(() => window.__pmgInputs || []);
}
async function n3NarrowNew(page) {
  const measure = contrastMethod(); await trustedInputs(page);
  const completedPath = arg('--completed-new-narrow');
  const completed = new Set(completedPath ? JSON.parse(readFileSync(completedPath, 'utf8')).measured_case_ids : []);
  result.previous_measured_new_narrow_case_ids = [...completed];
  const order = ['glass-light', 'retro-dark', 'retro-light', 'nier-dark', 'nier-light', 'basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark'];
  const carryover = ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark'];
  result.old_narrow_rows_retained = { actual_head: '7f7cb1491e1e81783482e2dc19b9f9d14230f889',
    page_sha256: '890c2f5ec86bfccb69294d17e62fb3c61ba580e94fbc21619953e2cce52e68b0',
    manifest_sha256: '6a3072e05d31172e442f6580a9e2a769f0f17e0b87a4cbb9ecf1a727383a7041', looks: carryover,
    reuse: 'Only after the separate exact page-delta proof and successful selector-scope proofs; no old evidence is relabeled.' };
  for (const look of order) {
    const state = await setOnboardingLook(page, look);
    await ruleScopeProof(page, 'SCOPE-narrow-' + look, { look, state, route: 'supported narrow O55 window' });
    if (carryover.includes(look)) continue;
    const actual = await page.evaluate(() => ({ layout: document.querySelector('#pm-o55-onboarding')?.getAttribute('data-o55-layout'),
      narrow: document.querySelector('#o55-demo')?.hasAttribute('data-o55-narrow'),
      button: document.querySelector('.o55-demopill').getBoundingClientRect().toJSON() }));
    if (actual.layout !== 'narrow' || !actual.narrow || actual.button.width !== 20 || actual.button.height !== 44) throw new Error('HOLD: supported narrow geometry drift');
    for (const pose of ['rest', 'hover', 'focus-visible']) {
      const id = 'NEW-NARROW-' + look + '-' + pose;
      if (!completed.has(id)) await newBytePose(page, measure, id, '.o55-demopill', '.o55-demopill > svg.nx', pose,
        { requirement: 'N3-narrow-demo', look, state, actual }, { x: 680, y: 870 });
    }
    if (look === 'glass-light') await reducedNative(page, 'NEW-NARROW-glass-light-RM', '.o55-demopill', '.o55-demopill > svg.nx',
      { requirement: 'N3-narrow-demo', look, actual }, { x: 680, y: 870 });
    const pill = await collectPills(page, 'NEW-PILL-NARROW-' + look, { requirement: 'N3-narrow-pill', look, state, actual }, ['floaters']);
    if (pill.status !== 'PASS') throw new Error('HOLD: new narrow floaters finding');
  }
  result.inputs = await page.evaluate(() => window.__pmgInputs || []);
  result.status = 'MEASURED_PENDING_FRAME_REVIEW';
}
async function r1(page) {
  await trustedInputs(page);
  const published = readFileSync(pagePath, 'utf8');
  const start = published.indexOf('/* ------------------------------------------------------------------ 8. hover ignite */');
  const end = published.indexOf('/* ------------------------------------------------------------------ 9.', start);
  if (start < 0 || end < start) throw new Error('UNVERIFIED: exact published native section8 rule not found');
  const rules = published.slice(start, end);
  writeFileSync(join(out, 'published-native-section8.css'), rules);
  result.R1_binding = { label: 'native-control-hover-under-PMH-rests', original_N1: 'UNVERIFIED/HOLD; this supplement cannot discharge N1',
    native_rule_sha256: sha(rules), host_selector: 'button,summary,[role="button"],[data-action] :hover/:focus-visible; direct/grandchild control/concept SVG, excluding the frozen self-lit hosts',
    unchanged_rule: 'Published neon-icons.css section8; Retro native phosphor rules and NieR native cut remain unchanged. No PMH card class is expected to ignite a deep glyph.' };
  let hold = false;
  const completedPath = arg('--completed-r1');
  const completed = new Set(completedPath ? JSON.parse(readFileSync(completedPath, 'utf8')).measured_case_ids : []);
  result.previous_measured_R1_case_ids = [...completed];
  const revealTools = async (card) => { const head = await page.locator(card + ' > .pmu-cardhead').boundingBox();
    await page.mouse.move(head.x + head.width / 2, head.y + head.height / 2); await sleep(500); };
  for (const [look, reduced] of [['glass-dark', false], ['retro-dark', false], ['nier-dark', false], ['basic-dark', false], ['glass-dark', true]]) {
    const state = await setLook(page, look, reduced), label = look + (reduced ? '-RM' : '');
    await page.evaluate(() => window.PM_PAGES.go('usage')); await sleep(2600);
    await page.locator('.page-tab[data-page="usage"]').click();
    const card = '.pmu-card[data-widget="ov-skyline"]';
    await page.locator(card).waitFor({ state: 'visible' });
    const controls = card + ' .pmu-cardtools button > svg.nx';
    const tool = card + ' button[data-tool="gear"]';
    const hoverId = 'R1-' + label + '-own-tool-hover';
    if (!completed.has(hoverId)) {
      const hover = await nativeHover(page, hoverId, tool, tool + ' > svg.nx',
        { requirement: 'R1-native-control-hover-under-PMH-rests', look, reduced, state, own_host: 'existing ov-skyline gear button' });
      if (hover.status === 'HOLD') { hold = true; break; }
    }
    await beginNativeTrace(page, controls + ',.pmu-menu .pmu-mcheck svg.nx', 'R1-' + label + '-menu-click-and-Escape');
    await revealTools(card);
    await page.locator(tool).click();
    const checked = '.pmu-menu .pmu-mitem:has(.pmu-mcheck svg.nx)';
    await page.locator(checked).first().waitFor({ state: 'visible', timeout: 10000 });
    await page.locator(checked).first().hover(); await sleep(800);
    const checkedHost = await page.locator(checked).first().evaluate((e) => ({ tag: e.tagName, cls: e.className, role: e.getAttribute('role'),
      exempt: e.getAttribute('data-pm-hover-exempt'), text: e.textContent.trim(), rect: e.getBoundingClientRect().toJSON(),
      glyphs: [...e.querySelectorAll('svg.nx')].map((g) => ({ glyph: g.dataset.nx, cls: g.getAttribute('class'), parent: g.parentElement.tagName })) }));
    await page.screenshot({ path: join(out, 'R1-' + label + '--menu-row-own-hover.png') });
    // The published gear menu has the selected follow-board radio check and keepOpen=true.
    // A real click on its own anchor closes it; selecting its row correctly keeps it open.
    await page.locator(tool).click(); await sleep(1100);
    const afterClick = await page.evaluate(nativeSample, controls + ',.pmu-menu .pmu-mcheck svg.nx');
    await revealTools(card);
    await page.locator(tool).click();
    await page.locator('.pmu-menu').waitFor({ state: 'visible' });
    const box = await page.locator(card).boundingBox();
    const pointer = { x: box.x + box.width / 2, y: box.y + Math.min(box.height / 2, 90) };
    await page.mouse.move(pointer.x, pointer.y); await sleep(600);
    await page.keyboard.press('Escape'); await sleep(1100);
    const afterEscape = await page.evaluate(nativeSample, controls);
    // Tab blurs the restored gear anchor through the actual browser focus route; any newly focused control keeps
    // its own native paint. The gear anchor's paint is then checked separately.
    await page.keyboard.press('Tab'); await sleep(900);
    const blurredAnchor = await page.evaluate(nativeSample, tool + ' > svg.nx');
    const menuTrace = await endNativeTrace(page);
    const noStuckAnchor = blurredAnchor.glyphs.every((g) => g.host?.hover || g.host?.focus_visible || (g.halo_alpha === '0' && g.halo_visibility === 'hidden'));
    result.cases.push({ id: 'R1-' + label + '-menu-click-Escape-focus-blur', requirement: 'R1-native-control-hover-under-PMH-rests', look, reduced, state,
      checkedHost, pointer_at_Escape: pointer, pointer_movement_after_Escape: [0, 0], afterClick, afterEscape, blurredAnchor, trace: menuTrace,
      no_stuck_blurred_anchor: noStuckAnchor, status: noStuckAnchor ? 'MEASURED_PENDING_FRAME_REVIEW' : 'HOLD' }); save();
    if (!noStuckAnchor) { hold = true; break; }
    // Existing page tabs are focusable published controls. The setup focus is recorded honestly; page activation
    // itself is a real trusted Enter while the mouse stays at the existing gear button's coordinates.
    await revealTools(card); await page.locator(tool).hover();
    const toolBox = await page.locator(tool).boundingBox(), stationary = { x: toolBox.x + toolBox.width / 2, y: toolBox.y + toolBox.height / 2 };
    await beginNativeTrace(page, controls, 'R1-' + label + '-keyboard-page-rests');
    await page.locator('.page-tab[data-page="dashboard"]').focus(); await page.keyboard.press('Enter'); await sleep(1800);
    const outgoing = await page.evaluate(nativeSample, controls);
    await page.locator('.page-tab[data-page="usage"]').focus(); await page.keyboard.press('Enter'); await sleep(3000);
    const incoming = await page.evaluate(nativeSample, controls);
    const pageTrace = await endNativeTrace(page);
    const noVisibleOutgoing = outgoing.glyphs.every((g) => !g.visible);
    result.cases.push({ id: 'R1-' + label + '-keyboard-page-rests', requirement: 'R1-native-control-hover-under-PMH-rests', look, reduced, state,
      focus_setup: 'locator.focus on the unchanged existing page tab; actual activation by trusted Enter', stationary_pointer: stationary,
      pointer_delta_during_switch: [0, 0], outgoing, incoming, trace: pageTrace, no_visible_outgoing_glyph: noVisibleOutgoing,
      status: noVisibleOutgoing ? 'MEASURED_PENDING_FRAME_REVIEW' : 'HOLD' }); save();
    if (!noVisibleOutgoing) { hold = true; break; }
    await page.locator('.page-tab[data-page="usage"]').click();
    for (const gesture of ['drag', 'resize']) {
      await revealTools(card);
      const locator = page.locator(gesture === 'drag' ? card + ' button[data-tool="grip"]' : card + ' .pmu-h[data-edge="se"]');
      const handle = await locator.boundingBox(), before = await page.locator(card).boundingBox();
      if (!handle || handle.y < 0 || handle.y + handle.height > 1080) throw new Error('UNVERIFIED: actual ' + gesture + ' control not visible');
      const x = handle.x + handle.width / 2, y = handle.y + handle.height / 2, dx = gesture === 'drag' ? -72 : (look === 'retro-dark' || look === 'basic-dark' ? -48 : 48), dy = gesture === 'drag' ? 24 : 24;
      await beginNativeTrace(page, controls, 'R1-' + label + '-' + gesture);
      await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + dx, y + dy, { steps: 12 }); await sleep(450);
      await page.screenshot({ path: join(out, 'R1-' + label + '--' + gesture + '-held.png') });
      await page.mouse.up(); await sleep(1800); await page.mouse.move(1850, 1000);
      await page.locator('.page-tab[data-page="usage"]').click(); await sleep(900);
      const after = await page.locator(card).boundingBox(), settled = await page.evaluate(nativeSample, controls), trace = await endNativeTrace(page);
      const noStuck = settled.glyphs.every((g) => !g.host?.hover && !g.host?.focus_visible && g.halo_alpha === '0' && g.halo_visibility === 'hidden');
      result.cases.push({ id: 'R1-' + label + '-' + gesture, requirement: 'R1-native-control-hover-under-PMH-rests', look, reduced, state,
        trusted_pointer_route: { start: { x, y }, delta: { x: dx, y: dy }, steps: 12 }, before, after, settled, trace,
        no_stuck_native_paint_after_leave_and_blur: noStuck, status: noStuck ? 'MEASURED_PENDING_FRAME_REVIEW' : 'HOLD' }); save();
      if (!noStuck) { hold = true; break; }
    }
    if (hold) break;
  }
  result.inputs = await page.evaluate(() => window.__pmgInputs || []);
  result.status = hold ? 'HOLD' : 'MEASURED_PENDING_FRAME_REVIEW';
}
async function countTraceStart(page, label) {
  await page.evaluate((name) => {
    const selector = '.sh-hcount,.fm-count,.pm-sumcard-h .c,#fmHintCount,#fmSelCount,#fmSelChipN';
    const roots = '#panel-testing,#panel-source,#panel-search';
    const ids = new WeakMap(), anims = new WeakMap(), previous = new Map(); let serial = 0, aSerial = 0;
    const id = (e) => { if (!ids.has(e)) ids.set(e, ++serial); return ids.get(e); };
    const path = (e) => { if (e.id) return '#' + e.id; const out = []; for (let p = e; p && !p.matches(roots); p = p.parentElement) {
      out.unshift(p.tagName.toLowerCase() + ':' + [...p.parentElement.children].indexOf(p)); } return e.closest(roots)?.id + '>' + out.join('>'); };
    const trace = window.__pmgCounts = { label: name, selector, rows: [], swaps: [], stopped: false };
    const sample = () => {
      for (const e of document.querySelectorAll(selector)) {
        if (!e.closest(roots)) continue;
        const key = path(e), text = e.textContent.trim(), n = parseFloat(text), prev = previous.get(key), node = id(e);
        if (!prev || prev.text !== text || prev.node !== node) {
          trace.rows.push({ type: prev ? 'text-change' : 'initial', at: performance.now(), utc_ms: Date.now(), key, node,
            text, numeric: Number.isNaN(n) ? null : n, previous_text: prev?.text ?? null, previous_numeric: prev?.numeric ?? null,
            previous_node: prev?.node ?? null, real_numeric_change: !!prev && !Number.isNaN(n) && prev.numeric != null && n !== prev.numeric,
            source_dCount: e._dCount, source_dCountN: Number.isNaN(e._dCountN) ? null : e._dCountN, visible: e.offsetParent !== null });
          previous.set(key, { text, numeric: Number.isNaN(n) ? null : n, node });
        }
        for (const a of e.getAnimations()) {
          if (anims.has(a)) continue; anims.set(a, ++aSerial);
          const frames = a.effect?.getKeyframes() || [], timing = a.effect?.getComputedTiming();
          const isRoll = /translateY\(-?60%\)/.test(frames[0]?.transform || '') && frames.at(-1)?.transform === 'none' && Number(frames[0]?.opacity) === 0 && Number(frames.at(-1)?.opacity) === 1;
          trace.rows.push({ type: 'animation', at: performance.now(), utc_ms: Date.now(), key, node, animation: aSerial, is_count_roll: isRoll,
            name: a.animationName || a.id, frames, duration: timing?.duration, easing: timing?.easing, start_time: a.startTime, play_state: a.playState });
        }
      }
      if (!trace.stopped) trace.raf = requestAnimationFrame(sample);
    };
    trace.observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        const e = m.target.nodeType === 1 ? m.target : m.target.parentElement;
        if (!e?.closest(roots)) continue;
        const g = e.closest('[data-gl]');
        if (g && (m.type === 'childList' || m.attributeName === 'data-gl')) trace.swaps.push({ at: performance.now(), utc_ms: Date.now(), panel: e.closest(roots).id,
          glyph: g.getAttribute('data-gl'), status: g.getAttribute('data-d-st'), mark_contains_text: !!g.textContent.trim(), mutation: m.type });
      }
    });
    trace.observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-gl'] }); sample();
  }, label);
}
async function countTraceEnd(page) {
  return page.evaluate(() => { const t = window.__pmgCounts; t.stopped = true; cancelAnimationFrame(t.raf); t.observer.disconnect();
    delete window.__pmgCounts; return { label: t.label, selector: t.selector, rows: t.rows, swaps: t.swaps }; });
}
async function n4(page) {
  await trustedInputs(page); const state = await setLook(page, 'glass-dark');
  if (await page.evaluate(() => window.PMR?.concepts.current() !== 'd')) throw new Error('UNVERIFIED: actual published rail is not D');
  await page.evaluate(() => window.PM_PAGES.go('dashboard'));
  for (const action of ['testing-run', 'source-stage', 'source-unstage', 'search-filter']) {
    if (arg('--only-n4') && arg('--only-n4') !== action) continue;
    const panel = action.startsWith('testing') ? 'testing' : action.startsWith('source') ? 'source' : 'search';
    if (!await page.locator('#panel-' + panel).isVisible()) await page.locator('[data-ab-id="' + panel + '"][data-target="panel-' + panel + '"]').click();
    await sleep(1800);
    const before = await page.evaluate((p) => ({ panel: p, theme: document.documentElement.dataset.theme,
      visible_controls: [...document.querySelectorAll('#panel-' + p + ' button,#panel-' + p + ' input')].filter((e) => e.offsetParent !== null).map((e) => ({ tag: e.tagName, text: e.textContent.trim(),
        action: e.dataset.demoAction, title: e.title, label: e.getAttribute('aria-label') })) }), panel);
    const selector = action === 'testing-run' ? '#panel-testing [data-demo-action="cmd.testing.run"]' : action === 'source-stage' ? '#panel-source [data-demo-action="cmd.git.stage_hunks"]' :
      action === 'source-unstage' ? '#panel-source [data-demo-action="cmd.git.unstage_hunks"]' : '#panel-search input[aria-label="Search in files"]';
    let target = null;
    for (const e of await page.locator(selector).all()) if (await e.isVisible() && await e.isEnabled()) { target = e; break; }
    if (!target) { result.cases.push({ id: 'N4-' + action, requirement: 'N4', state, before, selector, status: 'UNVERIFIED', reason: 'No actual visible supported control matches the requested published action; no alternate state invented.' }); save(); continue; }
    await countTraceStart(page, 'N4-' + action);
    if (action === 'search-filter') {
      await target.click(); await page.keyboard.press('Control+a'); await page.keyboard.type('no-such-glyph-current-case', { delay: 35 });
    } else await target.click();
    await sleep(4000);
    await page.screenshot({ path: join(out, 'N4-' + action + '--actual-after.png') });
    const trace = await countTraceEnd(page), changes = trace.rows.filter((r) => r.real_numeric_change), rolls = trace.rows.filter((r) => r.is_count_roll);
    const matches = changes.map((c) => ({ ...c, rolls: rolls.filter((a) => a.key === c.key && a.at >= c.at - 100 && a.at <= c.at + 500).length }));
    const noExtraRoll = rolls.every((a) => changes.some((c) => c.key === a.key && a.at >= c.at - 100 && a.at <= c.at + 500));
    const unexpected = matches.some((c) => c.rolls !== 1) || !noExtraRoll;
    result.cases.push({ id: 'N4-' + action, requirement: 'N4', look: 'glass-dark', state, before, actual_control_selector: selector, trace,
      actual_numeric_changes: changes.length, actual_count_rolls: rolls.length, changed_count_bindings: matches,
      mark_swaps: trace.swaps.length, no_roll_without_numeric_change: noExtraRoll,
      status: unexpected ? 'HOLD' : !changes.length ? 'UNVERIFIED' : 'MEASURED_PENDING_FRAME_REVIEW',
      reason: !changes.length ? 'The real published interaction produced no eligible numeric change; once-per-change acceptance cannot be inferred from zero observations.' : null }); save();
  }
  result.inputs = await page.evaluate(() => window.__pmgInputs || []);
  result.status = result.cases.some((c) => c.status === 'HOLD') || result.errors.length ? 'HOLD' : result.cases.some((c) => c.status === 'UNVERIFIED') ? 'UNVERIFIED' : 'MEASURED_PENDING_FRAME_REVIEW';
}
async function n2(page) {
  const measure = contrastMethod();
  await page.evaluate(() => window.PM_PAGES.go('dashboard'));
  await sleep(700);
  let hold = false;
  const completedFile = arg('--completed-cases');
  const completed = new Set(completedFile ? JSON.parse(readFileSync(completedFile, 'utf8')).measured_case_ids : []);
  result.previous_measured_case_ids = [...completed];
  for (const look of ['friendly-light', 'friendly-dark', 'glass-light', 'glass-dark']) {
    const state = await setLook(page, look);
    await page.mouse.move(5, 1050);
    await page.evaluate(() => { window.toast.clear(); window.toast.collapse(); });
    await sleep(1000);
    const bellId = 'N2-' + look + '-empty-bell';
    if (!completed.has(bellId)) {
      const bell = await measureGlyphs(page, measure, bellId, '#rsStack .rs-empty-bell', { requirement: 'N2', look, state, phase: 'empty-bell' });
      if (bell.contrast_status !== 'MEASURED') { hold = true; break; }
    }
    for (const severity of TOAST_KINDS) {
      for (const pose of ['rest', 'hover']) {
        const id = 'N2-' + look + '-stage-' + severity + '-' + pose;
        if (completed.has(id)) continue;
        // Wait for the published stage lifecycle to finish. toast.clear() clears the stack, not stage cards.
        // No timer, animation, geometry or production state is overridden for the paired pixel capture.
        await page.waitForFunction(() => !document.querySelector('#rsStage .n-card'), null, { timeout: 10000 });
        await page.evaluate((sev) => window.toast.push({ title: 'Current-base ' + sev, body: 'Glyph contrast and corner check.', severity: sev, important: false }), severity);
        await sleep(300);
        if (pose === 'hover') { await page.locator('#rsStage .n-card').first().locator('.n-x').hover(); await sleep(200); }
        const stageBefore = await page.evaluate(() => [...document.querySelectorAll('#rsStage .n-card')].map((e) => ({ title: e.querySelector('.n-title')?.textContent, cls: e.className })));
        const row = await measureGlyphs(page, measure, id,
          '#rsStage .n-card:first-child svg.nx', { requirement: 'N2', look, state, phase: 'stage', severity, pose, stage_before: stageBefore });
        await page.waitForFunction(() => !document.querySelector('#rsStage .n-card'), null, { timeout: 10000 });
        await page.mouse.move(5, 1050);
        if (row.contrast_status !== 'MEASURED') { hold = true; break; }
      }
      if (hold) break;
      await page.evaluate((sev) => window.toast.important({ title: 'Current-base ' + sev, body: 'Glyph contrast and corner check.', severity: sev }, { skipStage: true }), severity);
      await sleep(600);
      for (const pose of ['rest', 'hover']) {
        const id = 'N2-' + look + '-stack-' + severity + '-' + pose;
        if (completed.has(id)) continue;
        if (pose === 'hover') { await page.locator('#rsClip .n-card').first().locator('.n-x').hover(); await sleep(250); }
        const row = await measureGlyphs(page, measure, id,
          '#rsClip .n-card:first-child svg.nx', { requirement: 'N2', look, state, phase: 'stack-front', severity, pose });
        if (row.contrast_status !== 'MEASURED') { hold = true; break; }
      }
      await page.mouse.move(5, 1050);
      if (hold) break;
    }
    if (hold) break;
  }
  result.N2_contrast = hold ? 'HOLD_OR_UNVERIFIED; remaining contrast cases stopped for owner' : 'MEASURED_PENDING_FRAME_REVIEW';
  result.status = hold ? 'HOLD' : 'MEASURED_PENDING_FRAME_REVIEW';
}
try {
  result.global_helper_sessions_before = command(['list']);
  result.recording_request_utc_ms = Date.now();
  session = mode.startsWith('n3-narrow') ? command(['start', '--headed']) : command(['start', '--record', join(out, mode + '.mp4'), '--codec', 'h264']);
  result.browser_ready_utc_ms = Date.now();
  result.admitted_session = session; save();
  const spec = arg('--playwright-module', 'playwright-core');
  const { chromium } = await import(spec.startsWith('/') ? pathToFileURL(spec).href : spec);
  browser = await chromium.connectOverCDP(session.cdp_endpoint);
  const pages = browser.contexts()[0].pages().filter((p) => !session.recorder_url || !p.url().startsWith(session.recorder_url));
  if (pages.length !== 1) throw new Error('HOLD: expected exactly one admitted page');
  const page = pages[0];
  page.on('pageerror', (error) => { result.errors.push({ kind: 'pageerror', message: error.message }); save(); });
  page.on('console', (message) => { if (message.type() === 'error') { result.errors.push({ kind: 'console', message: message.text() }); save(); } });
  if (mode.startsWith('n3-narrow')) {
    const viewportSession = await page.context().newCDPSession(page);
    await viewportSession.send('Emulation.setDeviceMetricsOverride', { width: 700, height: 900, deviceScaleFactor: 1, mobile: false });
    // CSS viewport established before recording; the ordinary helper's 1920x1080 capture window is not resized.
    await admission(page, true);
    await page.evaluate(() => window.PM_O55_ONBOARDING.open({ screen: 'welcome' }));
    await page.waitForFunction(() => document.querySelector('#pm-o55-onboarding')?.getAttribute('data-o55-layout') === 'narrow' &&
      document.querySelector('#o55-demo')?.hasAttribute('data-o55-narrow'), null, { timeout: 15000 });
    await sleep(1800);
    result.before_recording_viewport = { utc_ms: Date.now(), ...await page.evaluate(() => ({ width: innerWidth, height: innerHeight, DPR: devicePixelRatio,
      layout: document.querySelector('#pm-o55-onboarding').getAttribute('data-o55-layout'), tab_width: document.querySelector('.o55-demopill').getBoundingClientRect().width })) };
    result.recording_request_utc_ms = Date.now();
    extraRecording = command(['start', '--source', 'window', '--window-id', session.window_id, '--output', join(out, mode + '.mp4'), '--codec', 'h264'], 'agent-record');
    result.extra_recording_admission = extraRecording; result.recording_ready_utc_ms = Date.now(); save();
  } else await admission(page);
  if (mode === 'admission') result.status = 'ADMISSION_VERIFIED';
  else if (mode === 'n1') await n1(page);
  else if (mode === 'n2') await n2(page);
  else if (mode === 'n3') await n3(page);
  else if (mode === 'n3-baseline') await n3Baseline(page);
  else if (mode === 'n3-narrow') await n3Narrow(page);
  else if (mode === 'n3-narrow-new') await n3NarrowNew(page);
  else if (mode === 'n3-chips-new') await n3ChipsNew(page);
  else if (mode === 'n3-pills-new') await n3PillsNew(page);
  else if (mode === 'r1') await r1(page);
  else if (mode === 'n4') await n4(page);
  else throw new Error('HOLD: case mode not implemented: ' + mode);
} catch (error) {
  result.status = 'HOLD'; result.errors.push({ kind: 'harness', message: String(error), stack: error.stack }); process.exitCode = 2;
} finally {
  if (browser) { try { await browser.close(); } catch (error) { result.errors.push({ kind: 'disconnect', message: String(error) }); } }
  try { stopOwned(); } catch (error) { result.status = 'HOLD'; result.errors.push({ kind: 'stop', message: String(error) }); process.exitCode = 2; }
  result.finished_utc = new Date().toISOString(); save();
  console.log(JSON.stringify({ mode, status: result.status, errors: result.errors, environment: result.environment, cases: result.cases.length }));
}
