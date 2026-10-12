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
function command(args) {
  const r = spawnSync('agent-browser', args, { encoding: 'utf8', timeout: 60000, maxBuffer: 4 * 1024 * 1024 });
  const record = { argv: ['agent-browser', ...args], exit_code: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error?.message || null };
  result.helper_commands ||= []; result.helper_commands.push(record); save();
  if (r.status !== 0 || r.error) throw new Error('HOLD: normal helper failed: ' + JSON.stringify(record));
  return JSON.parse(r.stdout);
}
let session = null, browser = null;
function stopOwned() {
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
async function admission(page) {
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
  if (result.environment.viewport.width !== 1920 || result.environment.viewport.height !== 1080 || result.environment.DPR !== 1) {
    throw new Error('HOLD: unexpected normal recording viewport/DPR: ' + JSON.stringify(result.environment));
  }
  await page.goto(pathToFileURL(pagePath).href + '?o55=off', { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.PM12_KIMI && window.PM7_SETTINGS_TOME && window.PM7_USAGE && window.O55 && window.PMH && window.toast,
    null, { timeout: 120000 });
  await setLook(page, 'glass-dark');
  await page.screenshot({ path: join(out, 'admission-glass-dark.png') });
  result.visible_state = await page.evaluate(() => ({
    pages: [...document.querySelectorAll('[data-page]')].slice(0, 20).map((e) => ({ tag: e.tagName, page: e.dataset.page, text: e.textContent.trim().slice(0, 70), role: e.getAttribute('role'), tabIndex: e.tabIndex })),
    toast_methods: Object.keys(window.toast),
    floater_glyphs: [...document.querySelectorAll('#o55-resume svg.nx,#o55-tourchip svg.nx,.o55-demopill svg.nx')].map((e) => ({ host: e.closest('[id]')?.id, glyph: e.dataset.nx })),
  }));
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
async function collectPills(page, id, fields) {
  const original = await page.evaluate(collector, { scopes: ['shell', 'floaters'] });
  const supplementary = await page.evaluate(companion, { scopes: ['floaters'] });
  const row = { id, ...fields, original_gate: { label: 'original shell,floaters', ...original },
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
async function populatedPills(page, id, look, state, fixture) {
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
  const row = await collectPills(page, id, { requirement: 'N2/N3-pill', look, state, fixture, actual_states: states });
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
  session = command(['start', '--record', join(out, mode + '.mp4'), '--codec', 'h264']);
  result.admitted_session = session; save();
  const spec = arg('--playwright-module', 'playwright-core');
  const { chromium } = await import(spec.startsWith('/') ? pathToFileURL(spec).href : spec);
  browser = await chromium.connectOverCDP(session.cdp_endpoint);
  const pages = browser.contexts()[0].pages().filter((p) => !session.recorder_url || !p.url().startsWith(session.recorder_url));
  if (pages.length !== 1) throw new Error('HOLD: expected exactly one admitted page');
  const page = pages[0];
  page.on('pageerror', (error) => { result.errors.push({ kind: 'pageerror', message: error.message }); save(); });
  page.on('console', (message) => { if (message.type() === 'error') { result.errors.push({ kind: 'console', message: message.text() }); save(); } });
  await admission(page);
  if (mode === 'admission') result.status = 'ADMISSION_VERIFIED';
  else if (mode === 'n1') await n1(page);
  else if (mode === 'n2') await n2(page);
  else if (mode === 'n3') await n3(page);
  else throw new Error('HOLD: case mode not implemented: ' + mode);
} catch (error) {
  result.status = 'HOLD'; result.errors.push({ kind: 'harness', message: String(error), stack: error.stack }); process.exitCode = 2;
} finally {
  if (browser) { try { await browser.close(); } catch (error) { result.errors.push({ kind: 'disconnect', message: String(error) }); } }
  try { stopOwned(); } catch (error) { result.status = 'HOLD'; result.errors.push({ kind: 'stop', message: String(error) }); process.exitCode = 2; }
  result.finished_utc = new Date().toISOString(); save();
  console.log(JSON.stringify({ mode, status: result.status, errors: result.errors, environment: result.environment, cases: result.cases.length }));
}
